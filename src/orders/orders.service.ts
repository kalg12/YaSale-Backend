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
import { ProductVariantOption } from '../entities/product-variant-option.entity';
import { ProductModifierOption } from '../entities/product-modifier-option.entity';
import {
  OrderItemModifier,
  ModifierType as OrderModifierType,
} from '../entities/order-item-modifier.entity';
import { AddOrderItemsDto } from './dto/add-order-items.dto';

// Local type to avoid unsafe access warnings when handling raw DTO payloads
// coming from request bodies.
type OrderItemInput = {
  productId: string;
  quantity: number;
  selectedVariants?: Array<{
    variantGroupId: string;
    optionId: string;
  }>;
  modifierIds?: string[];
  notes?: string;
};

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
    @InjectRepository(ProductVariantOption)
    private readonly variantOptionsRepository: Repository<ProductVariantOption>,
    @InjectRepository(ProductModifierOption)
    private readonly modifierOptionsRepository: Repository<ProductModifierOption>,
    @InjectRepository(OrderItemModifier)
    private readonly orderItemModifiersRepository: Repository<OrderItemModifier>,
    @Inject('PRINTING_SERVICE') private readonly printingClient: ClientProxy,
    private readonly socketGateway: SocketGateway,
  ) {}

  private async prepareOrderItems(
    storeId: string,
    order: Order,
    items: OrderItemInput[],
  ): Promise<{ orderItems: OrderItem[]; modifiers: OrderItemModifier[] }> {
    const productIds = Array.from(new Set(items.map((item) => item.productId)));
    const products = await this.productsRepository.find({
      where: { id: In(productIds), storeId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException(
        'One or more products not found in this store.',
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems: OrderItem[] = [];
    const modifiersToPersist: OrderItemModifier[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      let unitPrice = Number(product.basePrice);
      const selectedVariantsPayload: object[] = [];

      if (item.selectedVariants?.length) {
        const optionIds = item.selectedVariants.map((sv) => sv.optionId);
        const variantOptions = await this.variantOptionsRepository.find({
          where: { id: In(optionIds) },
          relations: ['variantGroup'],
        });

        if (variantOptions.length !== optionIds.length) {
          throw new NotFoundException(
            'One or more variant options were not found',
          );
        }

        const variantMap = new Map(
          variantOptions.map((variant) => [variant.id, variant]),
        );

        for (const selection of item.selectedVariants) {
          const variant = variantMap.get(selection.optionId);
          if (!variant) {
            throw new NotFoundException(
              `Variant option '${selection.optionId}' not found`,
            );
          }
          if (variant.variantGroup.productId !== product.id) {
            throw new NotFoundException(
              `Variant option '${variant.id}' does not belong to product '${product.id}'`,
            );
          }
          if (variant.variantGroupId !== selection.variantGroupId) {
            throw new NotFoundException(
              `Variant option '${variant.id}' does not belong to group '${selection.variantGroupId}'`,
            );
          }
          unitPrice += Number(variant.priceDelta);
          selectedVariantsPayload.push({
            variantGroupId: variant.variantGroupId,
            optionId: variant.id,
            name: variant.name,
            priceDelta: Number(variant.priceDelta),
          });
        }
      }

      let modifierPrice = 0;
      let modifierOptions: ProductModifierOption[] = [];
      if (item.modifierIds?.length) {
        modifierOptions = await this.modifierOptionsRepository.find({
          where: { id: In(item.modifierIds) },
          relations: ['modifierGroup'],
        });

        if (modifierOptions.length !== item.modifierIds.length) {
          throw new NotFoundException(
            'One or more modifier options were not found',
          );
        }

        for (const option of modifierOptions) {
          if (option.modifierGroup.productId !== product.id) {
            throw new NotFoundException(
              `Modifier option '${option.id}' does not belong to product '${product.id}'`,
            );
          }
          if (option.type === OrderModifierType.ADD) {
            modifierPrice += Number(option.priceDelta);
          }
        }
      }

      const unitPriceWithModifiers = unitPrice + modifierPrice;
      const totalPrice = unitPriceWithModifiers * item.quantity;

      const orderItem = this.orderItemsRepository.create({
        order,
        product,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPriceWithModifiers,
        totalPrice,
        notes: item.notes,
        selectedVariants: selectedVariantsPayload,
      });
      orderItems.push(orderItem);

      if (modifierOptions.length) {
        modifierOptions.forEach((option) => {
          modifiersToPersist.push(
            this.orderItemModifiersRepository.create({
              orderItem,
              modifierId: option.id,
              type:
                option.type === OrderModifierType.REMOVE
                  ? OrderModifierType.REMOVE
                  : OrderModifierType.ADD,
              price:
                option.type === OrderModifierType.ADD
                  ? Number(option.priceDelta)
                  : 0,
            }),
          );
        });
      }
    }

    await this.orderItemsRepository.save(orderItems);
    if (modifiersToPersist.length) {
      await this.orderItemModifiersRepository.save(modifiersToPersist);
    }

    return { orderItems, modifiers: modifiersToPersist };
  }

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

    const orderNumber = `ORDER-${Math.floor(Math.random() * 10000)}`; // TODO: Implement a more robust order numbering system

    const order = this.ordersRepository.create({
      ...orderData,
      number: orderNumber,
      storeId,
      waiterId,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.ordersRepository.save(order);

    await this.prepareOrderItems(
      storeId,
      savedOrder,
      items as OrderItemInput[],
    );

    const savedOrderId = savedOrder.id as string;
    const finalOrder = await this.ordersRepository.findOne({
      where: { id: savedOrderId },
      relations: [
        'items',
        'items.product',
        'items.modifiers',
      ] as unknown as string[],
    });

    if (!finalOrder) {
      throw new NotFoundException('Error retrieving created order');
    }

    // --- Emit Events ---
    this.socketGateway.emitToStore(storeId, 'order.created', finalOrder);
    this.printingClient.emit('print_job_created', { orderId: finalOrder.id });

    return finalOrder;
  }

  async addItems(
    tenantId: string,
    waiterId: string,
    orderId: string,
    addOrderItemsDto: AddOrderItemsDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { tenantId } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found.`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new NotFoundException('Cannot add items to a cancelled order.');
    }

    // If the order was already ready/completed, move it back to in progress
    if (
      order.status === OrderStatus.READY ||
      order.status === OrderStatus.COMPLETED
    ) {
      order.status = OrderStatus.IN_PROGRESS;
      order.startedAt = new Date();
      await this.ordersRepository.save(order);
    }

    await this.prepareOrderItems(
      order.storeId,
      order,
      addOrderItemsDto.items as OrderItemInput[],
    );

    const finalOrder = await this.ordersRepository.findOne({
      where: { id: order.id },
      relations: [
        'items',
        'items.product',
        'items.modifiers',
      ] as unknown as string[],
    });

    if (!finalOrder) {
      throw new NotFoundException('Error retrieving updated order');
    }

    this.socketGateway.emitToStore(order.storeId, 'order.updated', finalOrder);
    this.printingClient.emit('print_job_created', {
      orderId: finalOrder.id,
      reason: 'ORDER_ITEMS_ADDED',
      waiterId,
    });

    return finalOrder;
  }

  getKitchenQueue(tenantId: string, storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: {
        storeId,
        store: { tenantId },
        status: In([
          OrderStatus.PENDING,
          OrderStatus.IN_PROGRESS,
          OrderStatus.READY,
        ]),
      },
      order: { createdAt: 'ASC' },
      relations: ['items', 'items.product', 'items.modifiers'],
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
