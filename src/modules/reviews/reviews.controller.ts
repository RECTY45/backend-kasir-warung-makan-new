import { Controller, Get, Delete, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async findAll() {
    const reviews = await this.reviewsService.findAll();
    return reviews.map(r => ({
      ...r,
      id: r.id.toString(),
      orderId: r.orderId.toString(),
      userId: r.userId?.toString(),
    }));
  }

  @Post('bulk-delete')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async removeBulk(@Body('ids') ids: string[]) {
    return this.reviewsService.deleteBulk(ids.map(id => BigInt(id)));
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.reviewsService.delete(BigInt(id));
  }
}
