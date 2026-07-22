import { Injectable, Global } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogType } from '@prisma/client';

@Global()
@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(userId: bigint | null, action: string, module: string, details: string | null = null, type: LogType = LogType.info) {
    try {
      return await this.prisma.logHistory.create({
        data: {
          userId,
          action,
          module,
          details,
          type,
        },
      });
    } catch (err) {
      console.error('Failed to create audit log:', err);
    }
  }

  async findAll(query: { module?: string; type?: string; search?: string } = {}) {
    const { module, type, search } = query;
    
    return this.prisma.logHistory.findMany({
      where: {
        AND: [
          module ? { module } : {},
          type ? { type: type as LogType } : {},
          search ? { 
            OR: [
              { action: { contains: search } },
              { details: { contains: search } }
            ]
          } : {},
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async deleteBulk(ids: bigint[]) {
    return this.prisma.logHistory.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
