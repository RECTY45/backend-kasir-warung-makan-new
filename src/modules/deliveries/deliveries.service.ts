import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  async assignDriver(orderId: bigint, driverId: bigint) {
    return this.prisma.delivery.create({
      data: {
        orderId,
        driverId,
        status: 'delivering',
      },
    });
  }

  async updateStatus(deliveryId: bigint, status: string) {
    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status },
    });
  }

  async getDeliveriesByDriver(driverId: bigint) {
    return this.prisma.delivery.findMany({
      where: { driverId },
      include: { order: true },
    });
  }
}
