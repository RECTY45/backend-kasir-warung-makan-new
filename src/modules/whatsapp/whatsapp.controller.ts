import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsappController {
  constructor(
    private whatsappService: WhatsappService,
    private prisma: PrismaService,
  ) {}

  @Get('status')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('settings')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getSettings() {
    const number = await this.whatsappService.getAdminNumber();
    const envNum = (this.whatsappService as any).configService.get('WHATSAPP_SENDING_NUMBER');
    return { 
      admin_whatsapp_number: number,
      is_env_fixed: !!envNum 
    };
  }

  @Post('settings')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async updateSettings(@Body() body: { number: string }) {
    if (!body.number) {
      throw new BadRequestException('Phone number is required');
    }

    await this.prisma.systemSetting.upsert({
      where: { key: 'admin_whatsapp_number' },
      update: { value: body.number },
      create: { key: 'admin_whatsapp_number', value: body.number },
    });

    return { success: true };
  }

  @Get('logs')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getLogs() {
    const logs = await this.prisma.whatsappLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Convert BigInt to string for JSON serialization
    return logs.map(log => ({
      ...log,
      id: log.id.toString(),
    }));
  }

  @Post('test')
  @Roles(Role.SUPERADMIN)
  async sendTestMessage(@Body() body: { number: string }) {
    const success = await this.whatsappService.sendMessage(
      body.number,
      '📱 *TES KONEKSI WHATSAPP*\n\nBerhasil! Bot Anda sudah terhubung dan siap mengirimkan notifikasi dari sistem RM Siantar Minang Jaya.'
    );

    if (!success) {
      throw new BadRequestException('Gagal mengirim pesan tes. Pastikan bot sudah terhubung (Ready).');
    }

    return { success: true };
  }
}
