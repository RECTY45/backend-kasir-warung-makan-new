import { Controller, Post, Get, Body, Param, Put, Request, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private deliveriesService: DeliveriesService) {}

  @Post('assign')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async assign(@Body() body: { orderId: string; driverId: string }) {
    return this.deliveriesService.assignDriver(BigInt(body.orderId), BigInt(body.driverId));
  }

  @Put(':id/status')
  @Roles(Role.DRIVER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.deliveriesService.updateStatus(BigInt(id), status);
  }

  @Get('my')
  @Roles(Role.DRIVER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyDeliveries(@Request() req: any) {
    return this.deliveriesService.getDeliveriesByDriver(BigInt(req.user.id));
  }
}
