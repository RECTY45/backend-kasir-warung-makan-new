import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PromosService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Promo Banners ---
  async getActivePromos() {
    const promos = await this.prisma.promo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return promos.map(p => ({ ...p, id: p.id.toString() }));
  }

  async findAllPromos() {
    const promos = await this.prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return promos.map(p => ({ ...p, id: p.id.toString() }));
  }

  async createPromo(data: any) {
    return this.prisma.promo.create({ data });
  }

  async updatePromo(id: bigint, data: any) {
    if (data.image) {
      const oldPromo = await this.prisma.promo.findUnique({ where: { id } });
      if (oldPromo?.image && oldPromo.image.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), oldPromo.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    return this.prisma.promo.update({
      where: { id },
      data,
    });
  }

  async deletePromo(id: bigint) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (promo?.image && promo.image.startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), promo.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return this.prisma.promo.delete({ where: { id } });
  }

  // --- Vouchers ---
  async findAllVouchers() {
    const vouchers = await this.prisma.voucher.findMany({
      orderBy: { expiredAt: 'desc' },
    });
    return vouchers.map(v => ({ ...v, id: v.id.toString() }));
  }

  async findVoucherByCode(code: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
    });
    return voucher ? { ...voucher, id: voucher.id.toString() } : null;
  }

  async createVoucher(data: any) {
    return this.prisma.voucher.create({
      data: {
        ...data,
        expiredAt: new Date(data.expiredAt),
      },
    });
  }

  async updateVoucher(id: bigint, data: any) {
    return this.prisma.voucher.update({
      where: { id },
      data: {
        ...data,
        expiredAt: data.expiredAt ? new Date(data.expiredAt) : undefined,
      },
    });
  }

  async deleteVoucher(id: bigint) {
    return this.prisma.voucher.delete({ where: { id } });
  }

  async deletePromosBulk(ids: bigint[]) {
    const promos = await this.prisma.promo.findMany({
      where: { id: { in: ids } },
    });
    for (const promo of promos) {
      if (promo.image && promo.image.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), promo.image);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) {}
        }
      }
    }
    return this.prisma.promo.deleteMany({ where: { id: { in: ids } } });
  }

  async deleteVouchersBulk(ids: bigint[]) {
    return this.prisma.voucher.deleteMany({ where: { id: { in: ids } } });
  }
}
