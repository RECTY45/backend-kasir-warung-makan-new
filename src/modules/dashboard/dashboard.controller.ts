import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getStats() {
    const stats = await this.dashboardService.getStats();
    return {
      ...stats,
      recentOrders: stats.recentOrders.map(o => ({
        ...o,
        id: o.id.toString(),
        userId: o.userId?.toString(),
        tableId: o.tableId?.toString(),
        items: o.items.map(i => ({
          ...i,
          id: i.id.toString(),
          orderId: i.orderId.toString(),
          menuId: i.menuId.toString()
        }))
      }))
    };
  }
}
