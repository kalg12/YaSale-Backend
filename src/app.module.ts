import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ChecksModule } from './checks/checks.module';
import { ReportsModule } from './reports/reports.module';
import { SocketModule } from './socket/socket.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 3307,
        username: configService.get('DB_USER') || 'u223049366_yasale',
        password: configService.get('DB_PASSWORD') || 'Zztd7B3%k',
        database: configService.get('DB_NAME') || 'u223049366_yasale',
        entities: ['dist/**/*.entity.js'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    RabbitMQModule,
    AuthModule,
    UsersModule,
    MenuModule,
    ProductsModule,
    OrdersModule,
    ChecksModule,
    ReportsModule,
    SocketModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
