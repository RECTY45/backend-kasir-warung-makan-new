import { Controller, Get, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('infrastructure')
export class InfrastructureController {
  constructor(private readonly infraService: InfrastructureService) {}

  @Get('branding')
  async getBranding() {
    return this.infraService.getBranding();
  }

  @Get('settings')
  async getSettings() {
    return this.infraService.getSettings();
  }

  @Patch('settings')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateSetting(@Body('key') key: string, @Body('value') value: string, @Req() req: any) {
    if (!key || !value) throw new BadRequestException('Key dan value harus diisi');
    return this.infraService.updateSetting(key, value, BigInt(req.user.id));
  }

  @Patch('branding')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateBrandingName(@Body('name') name: string, @Req() req: any) {
    if (!name) throw new BadRequestException('Nama restoran harus diisi');
    return this.infraService.updateBrandingName(name, BigInt(req.user.id));
  }

  @Post('logo')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/branding';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml)$/)) {
        return cb(new BadRequestException('Format file tidak didukung'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
  }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('File logo tidak ditemukan');
    return this.infraService.updateLogo(file, BigInt(req.user.id));
  }
}
