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
import { ProductVariantOption } from '../entities/product-variant-option.entity';
import { ProductModifierOption } from '../entities/product-modifier-option.entity';
import { OrderItemModifier } from '../entities/order-item-modifier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Store,
      ProductVariantOption,
      ProductModifierOption,
      OrderItemModifier,
    ]),
    RabbitMQModule,
    SocketModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
