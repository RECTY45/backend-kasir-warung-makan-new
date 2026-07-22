import { Controller, Post, Get, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { GuestService } from './guest.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get('admin')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    const sessions = await this.guestService.findAll();
    return sessions.map(s => ({
      ...s,
      id: s.id.toString(),
      tableId: s.tableId?.toString(),
      ordersCount: s.orders.length
    }));
  }

  @Post('session')
  async createSession(@Body() body: { tableId?: string }) {
    const tableId = body.tableId ? BigInt(body.tableId) : undefined;
    return this.guestService.createSession(tableId);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.guestService.getSession(BigInt(id));
  }
  
  @Get('qr/:table_id')
  async handleQrScan(@Param('table_id') tableId: string) {
    return this.guestService.createSession(BigInt(tableId));
  }

  @Delete('session/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return this.guestService.remove(BigInt(id));
  }
}
