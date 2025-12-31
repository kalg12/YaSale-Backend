import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from '../entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { SocketGateway } from '../socket/socket.gateway';
import { Product } from '../entities/product.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Store } from '../entities/store.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @Inject('PRINTING_SERVICE') private readonly printingClient: ClientProxy,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(
    tenantId: string,
    waiterId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const { storeId, items, ...orderData } = createOrderDto;

    const store = await this.storeRepository.findOneBy({
      id: storeId,
      tenantId,
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const productIds = items.map((item) => item.productId);
    const dbProducts = await this.productsRepository.find({
      where: { id: In(productIds), storeId },
    });

    if (dbProducts.length !== productIds.length) {
      throw new NotFoundException(
        'One or more products not found in this store.',
      );
    }

    const orderNumber = `ORDER-${Math.floor(Math.random() * 10000)}`; // TODO: Implement a more robust order numbering system

    const order = this.ordersRepository.create({
      ...orderData,
      number: orderNumber,
      storeId,
      waiterId,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.ordersRepository.save(order);

    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);

      // CORRECCIÓN 1: Validar que el producto existe para TypeScript (TS18048)
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // TODO: Implement price calculation including variants and modifiers
      const unitPrice = product.basePrice;
      const totalPrice = unitPrice * item.quantity;

      const orderItem = this.orderItemsRepository.create({
        ...item,
        order: savedOrder,
        unitPrice,
        totalPrice,
      });
      orderItems.push(orderItem);
    }
    await this.orderItemsRepository.save(orderItems);

    const savedOrderId = savedOrder.id as string;
    const finalOrder = await this.ordersRepository.findOne({
      where: { id: savedOrderId },
      relations: ['items', 'items.product'] as unknown as string[],
    });

    if (!finalOrder) {
      throw new NotFoundException('Error retrieving created order');
    }

    // --- Emit Events ---
    this.socketGateway.emitToStore(storeId, 'order.created', finalOrder);
    this.printingClient.emit('print_job_created', { orderId: finalOrder.id });

    return finalOrder;
  }

  getKitchenQueue(tenantId: string, storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: {
        storeId,
        store: { tenantId },
        status: In([OrderStatus.PENDING, OrderStatus.IN_PROGRESS]),
      },
      order: { createdAt: 'ASC' },
      relations: ['items', 'items.product'],
    });
  }

  async updateStatus(
    tenantId: string,
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const { status } = updateOrderStatusDto;
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { tenantId } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found.`);
    }

    order.status = status;

    // Set timestamps based on status changes
    const statusValue = status as OrderStatus;
    if (statusValue === OrderStatus.IN_PROGRESS) {
      order.startedAt = new Date();
    } else if (statusValue === OrderStatus.READY) {
      order.readyAt = new Date();
    }

    const updatedOrder = await this.ordersRepository.save(order);

    // --- Emit Events ---
    if (updatedOrder.status === OrderStatus.IN_PROGRESS) {
      this.socketGateway.emitToStore(
        order.storeId,
        'order.started',
        updatedOrder,
      );
    } else if (updatedOrder.status === OrderStatus.READY) {
      this.socketGateway.emitToStore(
        order.storeId,
        'order.ready',
        updatedOrder,
      );
    }

    return updatedOrder;
  }
}
