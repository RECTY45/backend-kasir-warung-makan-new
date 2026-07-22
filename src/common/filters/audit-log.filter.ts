import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service';
import { LogType } from '@prisma/client';

@Catch()
export class AuditLogFilter implements ExceptionFilter {
  constructor(private auditLogsService: AuditLogsService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: exception.message || 'Internal Server Error' };

    const errorMessage = typeof exceptionResponse === 'object' 
      ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse) 
      : exceptionResponse;

    // If it's a 4xx or 5xx error, log it
    if (status >= 400) {
      const user = request.user;
      const actorId = user ? BigInt(user.id) : null;
      
      await this.auditLogsService.log(
        actorId,
        `Sistem Error: ${status}`,
        'Sistem/Security',
        `Path: ${request.url}\nError: ${errorMessage}`,
        status >= 500 ? LogType.danger : LogType.warning
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    });
  }
}
