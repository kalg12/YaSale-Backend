import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AddItemsToOrderDto } from './dto/add-order-items.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    if (!createOrderDto.storeId) {
      if (!user.activeStoreId) {
        throw new BadRequestException('storeId is required');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createOrderDto.storeId = user.activeStoreId;
    }
    return this.ordersService.create(
      user.tenantId,
      user.sub,
      createOrderDto,
      user.storeIds,
    );
  }

  @Get('kitchen/:storeId')
  @ApiOperation({ summary: 'Get the kitchen queue for a store' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  getKitchenQueue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    if (!user.storeIds.includes(storeId)) {
      throw new BadRequestException('User cannot access this store');
    }
    return this.ordersService.getKitchenQueue(user.tenantId, storeId);
  }

  @Get('kitchen')
  @ApiOperation({
    summary: 'Get the kitchen queue for the user active store',
    description: 'Uses activeStoreId from JWT when no storeId param is given',
  })
  getKitchenQueueForActiveStore(@CurrentUser() user: AuthenticatedUser) {
    if (!user.activeStoreId) {
      throw new BadRequestException('storeId is required');
    }
    return this.ordersService.getKitchenQueue(
      user.tenantId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      user.activeStoreId,
    );
  }

  @Post(':id/add-items')
  @ApiOperation({
    summary: 'Add items to an existing order (reopen flow while dining)',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  addItems(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addOrderItemsDto: AddItemsToOrderDto,
  ) {
    return this.ordersService.addItems(
      user.tenantId,
      user.sub,
      id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      addOrderItemsDto,
      user.storeIds,
    );
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Mark order as IN_PROGRESS', deprecated: true })
  @ApiParam({ name: 'id', description: 'Order ID' })
  startOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.updateStatus(user.tenantId, id, {
      status: OrderStatus.IN_PROGRESS,
    });
  }

  @Patch(':id/ready')
  @ApiOperation({ summary: 'Mark order as READY', deprecated: true })
  @ApiParam({ name: 'id', description: 'Order ID' })
  readyOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.updateStatus(user.tenantId, id, {
      status: OrderStatus.READY,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      user.tenantId,
      id,
      updateOrderStatusDto,
    );
  }
}
