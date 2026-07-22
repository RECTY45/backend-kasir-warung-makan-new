import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
  ) {}

  async processPayment(orderId: bigint, method: string, amount: number, proofPath?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Map non-CASH methods to EWALLET
    const prismaMethod = method === 'CASH' ? PaymentMethod.CASH : PaymentMethod.EWALLET;

    // Find the UNPAID payment record created by OrdersService
    const existingPayment = order.payments.find(p => p.status === PaymentStatus.UNPAID);

    if (existingPayment) {
      const payment = await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          method: prismaMethod,
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          proof: proofPath || undefined,
        },
      });

      this.sendWhatsAppPaymentNotification(orderId, amount, method, proofPath);
      return payment;
    }

    // Fallback: Create new if none exists
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method: prismaMethod,
        amount,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        proof: proofPath || null,
      },
    });

    this.sendWhatsAppPaymentNotification(orderId, amount, method, proofPath);
    return payment;
  }



  private async sendWhatsAppPaymentNotification(orderId: bigint, amount: number, method: string, proofPath?: string | null) {
    try {
      const adminNum = await this.whatsappService.getAdminNumber();
      if (!adminNum) return;

      const whatsappMessage = `*💰 PEMBAYARAN DITERIMA*\n` +
                              `----------------------------------\n` +
                              `*Order ID:* #${orderId.toString()}\n` +
                              `*Jumlah:* Rp ${new Intl.NumberFormat('id-ID').format(amount)}\n` +
                              `*Metode:* ${method}\n` +
                              `*Status:* LUNAS ✅\n` +
                              `----------------------------------\n` +
                              `Transaksi telah berhasil diverifikasi oleh sistem.`;

      if (proofPath) {
        await this.whatsappService.sendImage(adminNum, proofPath, whatsappMessage);
      } else {
        await this.whatsappService.sendMessage(adminNum, whatsappMessage);
      }
    } catch (err) {
      console.error('Failed to send WhatsApp payment note', err);
    }
  }


  async getPaymentByOrder(orderId: bigint) {
    return this.prisma.payment.findFirst({
      where: { orderId },
      include: { order: true }
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: { 
        order: { 
          include: { 
            user: { select: { name: true } },
            table: true 
          } 
        } 
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  async updateStatus(id: bigint, status: PaymentStatus) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { 
        status,
        paidAt: status === PaymentStatus.PAID ? new Date() : null
      },
    });

    if (status === PaymentStatus.PAID) {
      this.sendWhatsAppPaymentNotification(payment.orderId, Number(payment.amount), payment.method);
    }

    return payment;
  }
}
