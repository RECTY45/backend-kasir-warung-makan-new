import { Controller, Post, Get, Body, Param, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, PaymentMethod, PaymentStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.KASIR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createAdmin(@Body() body: { orderId: string; method: string; amount: number }) {
    const payment = await this.paymentsService.processPayment(BigInt(body.orderId), body.method, body.amount);
    return {
      id: payment.id.toString(),
      orderId: payment.orderId.toString(),
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
    };
  }

  @Post('process')
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
  @UseGuards(JwtAuthGuard)
  async process(
    @Body() body: { orderId: string; method: string; amount: string },
    @UploadedFile() file?: Express.Multer.File
  ) {
    const proofPath = file ? `/uploads/payments/${file.filename}` : undefined;
    const payment = await this.paymentsService.processPayment(
      BigInt(body.orderId), 
      body.method, 
      Number(body.amount), 
      proofPath
    );
    return {
      id: payment.id.toString(),
      orderId: payment.orderId.toString(),
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
      proof: payment.proof,
    };
  }



  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async findByOrder(@Param('orderId') orderId: string) {
    const payment = await this.paymentsService.getPaymentByOrder(BigInt(orderId));
    if (!payment) return null;
    return { ...payment, id: payment.id.toString(), orderId: payment.orderId.toString() };
  }

  @Get('debug-all')
  async debugGetAll() {
    return this.findAll();
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.KASIR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    const payments = await this.paymentsService.findAll();
    return payments.map(p => ({
      ...p,
      id: p.id.toString(),
      orderId: p.orderId.toString(),
      order: {
        ...p.order,
        id: p.order.id.toString(),
        userId: p.order.userId?.toString(),
        tableId: p.order.tableId?.toString()
      }
    }));
  }

  @Patch(':id/status')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.KASIR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.paymentsService.updateStatus(BigInt(id), status);
  }
}
