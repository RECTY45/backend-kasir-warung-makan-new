import { Controller, Get, Post, Body, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartsController {
  constructor(private cartsService: CartsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Request() req: any) {
    const userId = req.user.role !== 'GUEST' ? BigInt(req.user.id) : undefined;
    const guestSessionId = req.user.role === 'GUEST' ? BigInt(req.user.id) : undefined;
    return this.cartsService.getCart(userId, guestSessionId);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addItem(@Request() req: any, @Body() body: { menuId: string; qty: number }) {
    const userId = req.user.role !== 'GUEST' ? BigInt(req.user.id) : undefined;
    const guestSessionId = req.user.role === 'GUEST' ? BigInt(req.user.id) : undefined;
    const cart = await this.cartsService.getCart(userId, guestSessionId);
    return this.cartsService.addItem(cart!.id, BigInt(body.menuId), body.qty);
  }

  @Delete('remove/:itemId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param('itemId') itemId: string) {
    return this.cartsService.removeItem(BigInt(itemId));
  }

  @Post('update/:itemId') // Or Patch
  @UseGuards(JwtAuthGuard)
  async updateQuantity(@Param('itemId') itemId: string, @Body() body: { qty: number }) {
    return this.cartsService.updateQuantity(BigInt(itemId), body.qty);
  }
}
