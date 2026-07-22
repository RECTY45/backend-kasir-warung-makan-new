import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId?: bigint, guestSessionId?: bigint) {
    let cart = await this.prisma.cart.findFirst({
      where: {
        OR: [
          { userId: userId || undefined },
          { guestSessionId: guestSessionId || undefined },
        ],
      },
      include: {
        items: {
          include: { menu: true },
        },
      },
    });

    if (!cart && (userId || guestSessionId)) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          guestSessionId,
        },
        include: {
          items: {
            include: { menu: true },
          },
        },
      });
    }

    return cart;
  }

  async addItem(cartId: bigint, menuId: bigint, qty: number) {
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId, menuId },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + qty },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        menuId,
        qty,
      },
    });
  }

  async updateQuantity(cartItemId: bigint, qty: number) {
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { qty },
    });
  }

  async removeItem(cartItemId: bigint) {
    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: bigint) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
