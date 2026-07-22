import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, LogType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: bigint) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: any, actorId?: bigint) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        `Membuat user baru: ${user.name} (${user.role})`,
        'Manajemen User',
        `Email: ${user.email}`,
        LogType.success
      );
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async updateUser(id: bigint, data: any, actorId?: bigint) {
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        `Memperbarui user: ${user.name}`,
        'Manajemen User',
        `Role: ${user.role}, Email: ${user.email}`,
        LogType.info
      );
    }

    return user;
  }

  async remove(id: bigint, actorId?: bigint) {
    // Unlink records to preserve financial/business history
    await this.prisma.order.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    await this.prisma.delivery.updateMany({
      where: { driverId: id },
      data: { driverId: null },
    });

    // Delete temporary/personal data
    await this.prisma.notification.deleteMany({ where: { userId: id } });
    await this.prisma.review.deleteMany({ where: { userId: id } });

    const carts = await this.prisma.cart.findMany({ where: { userId: id } });
    const cartIds = carts.map(c => c.id);
    if (cartIds.length > 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
      await this.prisma.cart.deleteMany({ where: { userId: id } });
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    if (actorId && user) {
      await this.auditLogsService.log(
        actorId,
        `Menghapus user: ${user.name}`,
        'Manajemen User',
        `Role sebelumnya: ${user.role}`,
        LogType.warning
      );
    }

    return deletedUser;
  }

  async removeBulk(ids: bigint[], actorId?: bigint) {
    // Unlink records to preserve financial/business history
    await this.prisma.order.updateMany({
      where: { userId: { in: ids } },
      data: { userId: null },
    });

    await this.prisma.delivery.updateMany({
      where: { driverId: { in: ids } },
      data: { driverId: null },
    });

    // Delete temporary/personal data
    await this.prisma.notification.deleteMany({ where: { userId: { in: ids } } });
    await this.prisma.review.deleteMany({ where: { userId: { in: ids } } });

    const carts = await this.prisma.cart.findMany({ where: { userId: { in: ids } } });
    const cartIds = carts.map(c => c.id);
    if (cartIds.length > 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
      await this.prisma.cart.deleteMany({ where: { userId: { in: ids } } });
    }

    const result = await this.prisma.user.deleteMany({
      where: { id: { in: ids } }
    });

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        `Menghapus ${result.count} user secara masal`,
        'Manajemen User',
        `ID: ${ids.map(id => id.toString()).join(', ')}`,
        LogType.warning
      );
    }

    return result;
  }

  async importBulk(data: any[], actorId?: bigint) {
    const saltRounds = 10;
    
    try {
      // Hash passwords concurrently
      const processedData = await Promise.all(
        data.map(async (item) => {
          const pass = (item.password !== undefined && item.password !== null) ? String(item.password) : '123456';
          const hashedPassword = await bcrypt.hash(pass, saltRounds);
          return {
            name: item.name || 'Staff Baru',
            email: item.email,
            password: hashedPassword,
            role: item.role || 'CUSTOMER',
          };
        })
      );

      const validData = processedData.filter(u => u.email); // Wajib punya email

      if (validData.length === 0) return { count: 0 };

      const createdCount = await this.prisma.user.createMany({
        data: validData,
        skipDuplicates: true, // prevent crash on duplicate emails
      });

      if (actorId && createdCount.count > 0) {
        await this.auditLogsService.log(
          actorId,
          `Mengimpor ${createdCount.count} user baru via Excel`,
          'Manajemen User',
          'Import Excel',
          LogType.success
        );
      }

      return createdCount;
    } catch (error) {
      console.error('User Import Error:', error);
      throw new Error('Gagal memproses file Excel di database.');
    }
  }
}
