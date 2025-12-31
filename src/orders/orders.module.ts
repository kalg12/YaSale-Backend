import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { SocketModule } from '../socket/socket.module';
import { Store } from '../entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Store]),
    RabbitMQModule,
    SocketModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
