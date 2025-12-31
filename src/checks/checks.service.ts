import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateCheckDto } from './dto/create-check.dto';
import { AddOrderToCheckDto } from './dto/add-order-to-check.dto';
import { CloseCheckDto } from './dto/close-check.dto';
import { Check, CheckStatus } from '../entities/check.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { Order } from '../entities/order.entity';
import { CheckOrder } from '../entities/check-order.entity';

@Injectable()
export class ChecksService {
  constructor(
    @InjectRepository(Check)
    private readonly checksRepository: Repository<Check>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(CheckOrder)
    private readonly checkOrdersRepository: Repository<CheckOrder>,
    private readonly socketGateway: SocketGateway,
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    tenantId: string,
    waiterId: string,
    createCheckDto: CreateCheckDto,
  ): Promise<Check> {
    const checkNumber = `CHECK-${Math.floor(Math.random() * 10000)}`; // TODO: Implement a more robust numbering system
    const check = this.checksRepository.create({
      ...createCheckDto,
      number: checkNumber,
      waiterId,
      status: CheckStatus.OPEN,
      subtotal: 0,
      tax: 0,
      total: 0,
      storeId: createCheckDto.storeId, // Directly assign storeId
    });
    return this.checksRepository.save(check);
  }

  findOpenByStore(tenantId: string, storeId: string): Promise<Check[]> {
    return this.checksRepository.find({
      where: {
        storeId,
        store: { tenantId },
        status: CheckStatus.OPEN,
      },
      relations: ['orders', 'orders.order'],
    });
  }

  async addOrder(
    tenantId: string,
    checkId: string,
    addOrderToCheckDto: AddOrderToCheckDto,
  ): Promise<Check> {
    const { orderId } = addOrderToCheckDto;

    return this.entityManager.transaction(async (txManager) => {
      const check = await txManager.findOne(Check, {
        where: { id: checkId, store: { tenantId } },
      });
      if (!check) {
        throw new NotFoundException(`Check with ID '${checkId}' not found.`);
      }

      const order = await txManager.findOne(Order, {
        where: { id: orderId, storeId: check.storeId },
        relations: ['items'],
      });
      if (!order) {
        throw new NotFoundException(`Order with ID '${orderId}' not found.`);
      }

      const orderTotal = order.items.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );

      const newSubtotal = Number(check.subtotal) + orderTotal;
      const newTax = newSubtotal * 0.1; // Placeholder for tax calculation
      const newTotal = newSubtotal + newTax;

      await txManager.save(CheckOrder, { checkId, orderId });

      check.subtotal = newSubtotal;
      check.tax = newTax;
      check.total = newTotal;

      return txManager.save(check);
    });
  }

  async close(
    tenantId: string,
    checkId: string,
    closeCheckDto: CloseCheckDto,
  ): Promise<Check> {
    const { tip = 0 } = closeCheckDto;

    const check = await this.checksRepository.findOne({
      where: { id: checkId, store: { tenantId } },
    });

    if (!check) {
      throw new NotFoundException(`Check with ID '${checkId}' not found.`);
    }

    const newTotal = Number(check.total) + tip;

    check.tip = tip;
    check.total = newTotal;
    check.status = CheckStatus.PAID;
    check.paidAt = new Date();

    const updatedCheck = await this.checksRepository.save(check);

    this.socketGateway.emitToStore(check.storeId, 'check.paid', updatedCheck);

    return updatedCheck;
  }
}
