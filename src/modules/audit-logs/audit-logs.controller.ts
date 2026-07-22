import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.SUPERADMIN)
  async getLogs(
    @Query('module') module?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.auditLogsService.findAll({ module, type, search });
  }

  @Post('bulk-delete')
  @Roles(Role.SUPERADMIN)
  async deleteBulk(@Body('ids') ids: string[]) {
    return this.auditLogsService.deleteBulk(ids.map(id => BigInt(id)));
  }
}
