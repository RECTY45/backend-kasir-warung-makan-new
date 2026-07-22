import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PromosService } from './promos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get()
  async getActivePromos() {
    return this.promosService.getActivePromos();
  }

  // --- Admin Endpoints for Promos ---
  @Get('admin/all')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllPromos() {
    return this.promosService.findAllPromos();
  }

  @Post('admin')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/promos';
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
  async createPromo(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const { title, description, isActive } = body;
    const imagePath = file ? `/uploads/promos/${file.filename}` : body.image;
    return this.promosService.createPromo({ 
      title, 
      description, 
      image: imagePath, 
      isActive: isActive === 'true' || isActive === true 
    });
  }

  @Put('admin/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/promos';
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
  async updatePromo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const { title, description, isActive, image } = body;
    const imagePath = file ? `/uploads/promos/${file.filename}` : image;
    return this.promosService.updatePromo(BigInt(id), { 
      title, 
      description, 
      image: imagePath, 
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined 
    });
  }

  @Delete('admin/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deletePromo(@Param('id') id: string) {
    return this.promosService.deletePromo(BigInt(id));
  }

  @Post('admin/bulk-delete')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deletePromosBulk(@Body('ids') ids: string[]) {
    return this.promosService.deletePromosBulk(ids.map(id => BigInt(id)));
  }

  // --- Admin Endpoints for Vouchers ---
  @Get('vouchers/admin/all')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllVouchers() {
    return this.promosService.findAllVouchers();
  }

  @Post('vouchers/admin')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createVoucher(@Body() body: any) {
    const { code, discount, expiredAt } = body;
    return this.promosService.createVoucher({ code, discount, expiredAt });
  }

  @Put('vouchers/admin/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateVoucher(@Param('id') id: string, @Body() body: any) {
    const { code, discount, expiredAt } = body;
    return this.promosService.updateVoucher(BigInt(id), { code, discount, expiredAt });
  }

  @Delete('vouchers/admin/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteVoucher(@Param('id') id: string) {
    return this.promosService.deleteVoucher(BigInt(id));
  }

  @Post('vouchers/admin/bulk-delete')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteVouchersBulk(@Body('ids') ids: string[]) {
    return this.promosService.deleteVouchersBulk(ids.map(id => BigInt(id)));
  }

  @Get('vouchers/verify/:code')
  @UseGuards(JwtAuthGuard)
  async verifyVoucher(@Param('code') code: string) {
    return this.promosService.findVoucherByCode(code);
  }
}
