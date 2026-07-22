import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [
      revenue,
      orderStatusCount,
      topMenus,
      recentOrders,
    ] = await Promise.all([
      // 1. Weekly Revenue (Paid Payments)
      this.prisma.payment.groupBy({
        by: ['paidAt'],
        where: {
          status: PaymentStatus.PAID,
          paidAt: {
            gte: sevenDaysAgo,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // 2. Order Status Distribution
      this.prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),

      // 3. Top 5 Best-selling Menus
      this.prisma.orderItem.groupBy({
        by: ['menuId'],
        _sum: {
          qty: true,
        },
        orderBy: {
          _sum: {
            qty: 'desc',
          },
        },
        take: 5,
      }),

      // 4. Recent Orders (Last 10)
      this.prisma.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: { select: { name: true } },
          items: { include: { menu: true } },
        },
      }),
    ]);

    // Manual grouping for revenue by day since Prisma groupBy by paidAt includes time
    const revenueByDay = this.formatRevenueByDay(revenue);

    // Fetch menu names for top menus
    const topMenuIds = topMenus.map((m) => m.menuId);
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: topMenuIds } },
      select: { id: true, name: true },
    });

    const formattedTopMenus = topMenus.map((tm) => ({
      name: menus.find((m) => m.id === tm.menuId)?.name || 'Unknown',
      qty: tm._sum.qty,
    }));

    return {
      revenueByDay,
      orderStatusCount,
      topMenus: formattedTopMenus,
      recentOrders,
    };
  }

  private formatRevenueByDay(revenue: any[]) {
    const days = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = 0;
    }

    revenue.forEach((r) => {
      if (r.paidAt) {
        const dateStr = r.paidAt.toISOString().split('T')[0];
        if (days[dateStr] !== undefined) {
          days[dateStr] += Number(r._sum.amount);
        }
      }
    });

    return Object.keys(days)
      .map((date) => ({ date, amount: days[date] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
