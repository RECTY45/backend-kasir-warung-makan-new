import { Controller, Get, Patch, Post, Body, Request, UseGuards, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(u => ({ ...u, id: u.id.toString() }));
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Request() req: any, @Body() body: any) {
    const user = await this.usersService.create(body, BigInt(req.user.id));
    return { ...user, id: user.id.toString() };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(BigInt(req.user.id));
    if (!user) return null;
    return { ...user, id: user.id.toString() };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req: any, @Body() body: any) {
    const userId = BigInt(req.user.id);
    const updated = await this.usersService.updateUser(userId, body);
    return { ...updated, id: updated.id.toString() };
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const updated = await this.usersService.updateUser(BigInt(id), body, BigInt(req.user.id));
    return { ...updated, id: updated.id.toString() };
  }

  @Post('bulk-delete')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeBulk(@Request() req: any, @Body('ids') ids: string[]) {
    return this.usersService.removeBulk(ids.map(id => BigInt(id)), BigInt(req.user.id));
  }

  @Post('bulk-import')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async importBulk(@Request() req: any, @Body('data') data: any[]) {
    return this.usersService.importBulk(data, BigInt(req.user.id));
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.usersService.remove(BigInt(id), BigInt(req.user.id));
  }
}
