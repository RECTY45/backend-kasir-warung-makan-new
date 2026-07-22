import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId?: bigint; guestSessionId?: bigint; title: string; message: string }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId || null,
        guestSessionId: data.guestSessionId || null,
        title: data.title,
        message: data.message,
      },
    });
  }

  async findAll(userId?: bigint, guestSessionId?: bigint) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { userId: userId || undefined },
          { guestSessionId: guestSessionId || undefined },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: bigint) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId?: bigint, guestSessionId?: bigint) {
    return this.prisma.notification.updateMany({
      where: {
        OR: [
          { userId: userId || undefined },
          { guestSessionId: guestSessionId || undefined },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async findAllAdmin() {
    return this.prisma.notification.findMany({
      include: { user: { select: { name: true } }, guestSession: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
