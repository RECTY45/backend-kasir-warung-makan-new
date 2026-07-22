import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  async getAvailability(@Query('date') date: string) {
    if (!date) return [];
    return this.reservationsService.getAvailability(date);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.reservationsService.getReservationById(BigInt(id));
  }

  @Post('my-history')
  async getMyHistory(@Body() body: { ids: string[] }, @Request() req: any) {
    const userId = req?.user?.id && req?.user?.role !== 'GUEST' ? BigInt(req.user.id) : undefined;
    const ids = (body.ids || []).map(id => BigInt(id));
    return this.reservationsService.getMyHistory(userId, ids);
  }

  // Allow guests (no guard) or logged in users to create reservation
  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: any,
  ) {
    const userId = req?.user?.id ? BigInt(req.user.id) : undefined;
    return this.reservationsService.create(createReservationDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.KASIR, Role.ADMIN, Role.SUPERADMIN)
  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.KASIR, Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(BigInt(id), updateDto);
  }

  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/payments';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const proofPath = file ? `/uploads/payments/${file.filename}` : null;
    return this.reservationsService.updateProof(BigInt(id), proofPath);
  }
}
