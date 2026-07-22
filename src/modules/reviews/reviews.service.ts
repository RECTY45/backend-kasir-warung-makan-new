import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        order: { include: { items: { include: { menu: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: bigint) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        order: true,
      },
    });
  }

  async delete(id: bigint) {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  async deleteBulk(ids: bigint[]) {
    return this.prisma.review.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
