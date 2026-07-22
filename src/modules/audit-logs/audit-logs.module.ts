import { Module, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogFilter } from '../../common/filters/audit-log.filter';

@Global()
@Module({
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    {
      provide: APP_FILTER,
      useClass: AuditLogFilter,
    },
  ],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
