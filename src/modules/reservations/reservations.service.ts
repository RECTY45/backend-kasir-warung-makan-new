import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateReservationDto, userId?: bigint) {
    const { items, paymentType, tableId, ...reservationData } = dto;
    let orderId: bigint | undefined = undefined;

    return this.prisma.$transaction(async (tx) => {
      // 1. If there are items, create an order
      if (items && items.length > 0) {
        const totalPrice = items.reduce((sum, item) => sum + item.qty * item.price, 0);

        const order = await tx.order.create({
          data: {
            userId,
            tableId: tableId ? BigInt(tableId) : null,
            orderSource: 'APP',
            orderType: 'DINE_IN',
            status: 'PENDING',
            totalPrice,
            items: {
              create: items.map(item => ({
                menuId: BigInt(item.menuId),
                qty: item.qty,
                price: item.price
              }))
            }
          }
        });

        orderId = order.id;

        // DP Payment Handling will now be deferred to when the reservation is approved by the admin.
      }

      // 2. Create the Reservation
      return tx.reservation.create({
        data: {
          name: reservationData.name,
          phone: reservationData.phone,
          date: new Date(reservationData.date),
          guestCount: reservationData.guestCount,
          notes: reservationData.notes,
          userId,
          tableId: tableId ? BigInt(tableId) : null,
          orderId,
          paymentType,
        }
      });
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      orderBy: { date: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        table: true,
        order: {
          include: {
            items: { include: { menu: true } },
            payments: true
          }
        }
      },
    });
  }

  async getReservationById(id: bigint) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        order: {
          include: {
            items: {
              include: { menu: true }
            },
            payments: true
          }
        }
      }
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async getMyHistory(userId?: bigint, ids: bigint[] = []) {
    const orConditions: any[] = [];
    if (userId) orConditions.push({ userId });
    if (ids && ids.length > 0) orConditions.push({ id: { in: ids } });

    if (orConditions.length === 0) return [];

    const reservations = await this.prisma.reservation.findMany({
      where: { OR: orConditions },
      include: {
        table: true,
        order: { include: { items: { include: { menu: true } }, payments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reservations.map(r => ({
      ...r,
      id: r.id.toString(),
      userId: r.userId?.toString(),
      tableId: r.tableId?.toString(),
      orderId: r.orderId?.toString(),
      order: r.order ? {
        ...r.order,
        id: r.order.id.toString(),
        totalPrice: Number(r.order.totalPrice),
        items: (r.order as any).items?.map(i => ({
          ...i,
          id: i.id.toString(),
          orderId: i.orderId.toString(),
          menuId: i.menuId.toString(),
          price: Number(i.price)
        })) || [],
        payments: (r.order as any).payments?.map(p => ({
          ...p,
          id: p.id.toString(),
          orderId: p.orderId.toString(),
          amount: Number(p.amount)
        })) || []
      } : null
    }));
  }

  async updateStatus(id: bigint, updateDto: UpdateReservationStatusDto) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: updateDto.status,
        ...(updateDto.notes && { notes: updateDto.notes }),
      },
      include: { order: true }
    });

    if (updateDto.status === ReservationStatus.APPROVED && updated.orderId) {
      await this.prisma.order.update({
        where: { id: updated.orderId },
        data: { status: 'CONFIRMED' }
      });

      // Automatically create PAID payment record when reservation is approved
      const existingPayments = await this.prisma.payment.findMany({
        where: { orderId: updated.orderId }
      });

      if (existingPayments.length === 0 && updated.order) {
        const totalPrice = Number(updated.order.totalPrice);
        const paymentAmount = updated.paymentType === 'DP' ? totalPrice / 2 : totalPrice;

        await this.prisma.payment.create({
          data: {
            orderId: updated.orderId,
            method: 'EWALLET', // default for online verifications
            amount: paymentAmount,
            status: 'PAID',
            paidAt: new Date(),
          }
        });
      }
    }

    // Create Notification
    let title = 'Update Reservasi 🔔';
    let message = `Status reservasi meja untuk nama ${updated.name} kini berubah menjadi ${updateDto.status}.`;

    if (updateDto.status === ReservationStatus.APPROVED) {
      title = 'Reservasi Disetujui ✅';
      message = `Reservasi Anda atas nama ${updated.name} telah disetujui. Sampai jumpa!`;
    } else if (updateDto.status === ReservationStatus.REJECTED) {
      title = 'Reservasi Ditolak ❌';
      message = `Mohon maaf, reservasi Anda atas nama ${updated.name} tidak dapat kami penuhi saat ini.`;
    } else if (updateDto.status === ReservationStatus.COMPLETED) {
      title = 'Reservasi Selesai 🍽️';
      message = `Terima kasih atas kunjungannya, ${updated.name}!`;
    }

    await this.notificationsService.create({
      userId: updated.userId || undefined,
      title,
      message,
    });

    return updated;
  }

  async updateProof(id: bigint, proofPath: string | null) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return this.prisma.reservation.update({
      where: { id },
      data: { paymentProof: proofPath }
    });
  }

  async getAvailability(dateString: string) {
    // Expected dateString: 'YYYY-MM-DD'
    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
    
    // Fetch all active tables
    const tables = await this.prisma.table.findMany({
      where: { status: 'AKTIF' }
    });

    // Fetch reservations for the given date
    const reservations = await this.prisma.reservation.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['CANCELLED', 'REJECTED']
        }
      },
      select: { tableId: true }
    });

    const bookedTableIds = new Set(reservations.map(r => r.tableId?.toString()));

    return tables.map(table => ({
      ...table,
      id: table.id.toString(),
      isBooked: bookedTableIds.has(table.id.toString())
    }));
  }
}
