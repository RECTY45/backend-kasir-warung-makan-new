import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappTasksService {
  private readonly logger = new Logger(WhatsappTasksService.name);

  constructor(
    private whatsappService: WhatsappService,
    private prisma: PrismaService,
  ) {}

  // Every night at 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMidnightReport() {
    this.logger.log('Running midnight revenue report...');
    
    try {
      const adminNum = await this.whatsappService.getAdminNumber();
      if (!adminNum) {
        this.logger.warn('Admin WhatsApp number not set. Skipping report.');
        return;
      }

      // Calculate today's revenue (from the day that just ended)
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const completedOrders = await this.prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          }
        }
      });

      const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
      const totalOrders = completedOrders.length;

      const dateStr = yesterdayStart.toLocaleDateString('id-ID', { dateStyle: 'long' });

      const reportMessage = `*📊 LAPORAN PENDAPATAN HARIAN*\n` +
                            `----------------------------------\n` +
                            `*Tanggal:* ${dateStr}\n` +
                            `*Total Pesanan Selesai:* ${totalOrders}\n` +
                            `*Total Omzet:* Rp ${new Intl.NumberFormat('id-ID').format(totalRevenue)}\n` +
                            `----------------------------------\n` +
                            `Terima kasih sudah menggunakan sistem RM Siantar Minang Jaya! 🚀`;

      await this.whatsappService.sendMessage(adminNum, reportMessage);
      this.logger.log(`Midnight report sent to ${adminNum}`);
    } catch (error) {
      this.logger.error('Error in handleMidnightReport', error);
    }
  }
}
