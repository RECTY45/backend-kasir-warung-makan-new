import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('tables')
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get()
  async findAll() {
    return this.tablesService.findAll();
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: any) {
    const { name, capacity } = body;
    return this.tablesService.create({ name, capacity: capacity ? parseInt(capacity) : 4 });
  }

  @Get(':id/qr')
  async getQr(@Param('id') id: string) {
    return { qr: await this.tablesService.generateQr(BigInt(id)) };
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return this.tablesService.remove(BigInt(id));
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const { name, status, capacity } = body;
    return this.tablesService.update(BigInt(id), { name, status, capacity: capacity ? parseInt(capacity) : undefined });
  }
}
