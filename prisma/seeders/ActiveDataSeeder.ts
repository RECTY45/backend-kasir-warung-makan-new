import { PrismaClient, Role, OrderStatus, OrderType, OrderSource, PaymentMethod, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

export async function seedActiveData(prisma: PrismaClient) {
  const password = await bcrypt.hash('password123', 10);
  const menus = await prisma.menu.findMany();
  const tables = await prisma.table.findMany();

  console.log('🌱 Generating 30 active customers with data...');

  for (let i = 1; i <= 30; i++) {
    // 1. Create User
    const user = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        password,
        name: faker.person.fullName(),
        role: Role.CUSTOMER,
      }
    });

    // 2. Create a Cart with some items
    const cart = await prisma.cart.create({
      data: { userId: user.id }
    });
    
    const cartItemCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < cartItemCount; j++) {
      const randomMenu = menus[Math.floor(Math.random() * menus.length)];
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuId: randomMenu.id,
          qty: faker.number.int({ min: 1, max: 2 })
        }
      });
    }

    // 3. Create Orders (2-4 per user)
    const orderCount = faker.number.int({ min: 2, max: 4 });
    for (let k = 0; k < orderCount; k++) {
      const statusList = [OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.READY, OrderStatus.COMPLETED];
      const status = statusList[Math.floor(Math.random() * statusList.length)];
      
      const orderType = Math.random() > 0.3 ? OrderType.DINE_IN : OrderType.TAKEAWAY;
      const orderSource = Math.random() > 0.5 ? OrderSource.APP : OrderSource.QR;
      
      let totalPrice = 0;
      const orderItems: any[] = [];
      const itemCount = faker.number.int({ min: 2, max: 5 });
      
      for (let m = 0; m < itemCount; m++) {
        const menu = menus[Math.floor(Math.random() * menus.length)];
        const qty = faker.number.int({ min: 1, max: 2 });
        totalPrice += Number(menu.price) * qty;
        orderItems.push({
          menuId: menu.id,
          qty,
          price: menu.price
        });
      }

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          tableId: orderType === OrderType.DINE_IN ? tables[Math.floor(Math.random() * tables.length)].id : null,
          orderSource,
          orderType,
          status,
          totalPrice,
          address: orderType === OrderType.TAKEAWAY ? faker.location.streetAddress() : null,
          createdAt: faker.date.recent({ days: 10 }),
          items: {
            create: orderItems
          }
        }
      });

      // 4. Payments
      if (status === OrderStatus.COMPLETED || status === OrderStatus.READY || Math.random() > 0.5) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            method: Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.EWALLET,
            status: (status === OrderStatus.COMPLETED) ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            amount: totalPrice,
            paidAt: (status === OrderStatus.COMPLETED) ? new Date() : null
          }
        });
      }

      // 5. Reviews (Only for COMPLETED)
      if (status === OrderStatus.COMPLETED && Math.random() > 0.3) {
        await prisma.review.create({
          data: {
            orderId: order.id,
            userId: user.id,
            rating: faker.number.int({ min: 4, max: 5 }),
            comment: faker.lorem.sentence(),
          }
        });
      }

      // 6. Notifications
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Update Pesanan',
          message: `Pesanan #${order.id.toString()} Anda kini berstatus ${status}.`,
          isRead: Math.random() > 0.5,
          createdAt: new Date()
        }
      });
    }
  }

  console.log('✅ 30 Active Customers with complex data seeded');
}
