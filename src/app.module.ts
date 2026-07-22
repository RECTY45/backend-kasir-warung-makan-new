import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MenusModule } from './modules/menus/menus.module';
import { TablesModule } from './modules/tables/tables.module';
import { GuestModule } from './modules/guest/guest.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';

import { NotificationsModule } from './modules/notifications/notifications.module';
import { PromosModule } from './modules/promos/promos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { InfrastructureModule } from './modules/infrastructure/infrastructure.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    MenusModule,
    TablesModule,
    GuestModule,
    CartsModule,
    OrdersModule,
    PaymentsModule,
    DeliveriesModule,

    NotificationsModule,
    PromosModule,
    DashboardModule,
    ReviewsModule,
    WhatsappModule,
    AuditLogsModule,
    InfrastructureModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
