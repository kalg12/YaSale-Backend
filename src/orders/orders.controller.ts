import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
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
import { AddOrderItemsDto } from './dto/add-order-items.dto';

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
    // TODO: Validate that user has access to the storeId
    return this.ordersService.create(user.tenantId, user.sub, createOrderDto);
  }

  @Get('kitchen/:storeId')
  @ApiOperation({ summary: 'Get the kitchen queue for a store' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  getKitchenQueue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    // TODO: Validate that user has access to this storeId
    return this.ordersService.getKitchenQueue(user.tenantId, storeId);
  }

  @Post(':id/items')
  @ApiOperation({
    summary: 'Add items to an existing order (reopen flow while dining)',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  addItems(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addOrderItemsDto: AddOrderItemsDto,
  ) {
    return this.ordersService.addItems(
      user.tenantId,
      user.sub,
      id,
      addOrderItemsDto,
    );
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Mark order as IN_PROGRESS' })
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
  @ApiOperation({ summary: 'Mark order as READY' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  readyOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.updateStatus(user.tenantId, id, {
      status: OrderStatus.READY,
    });
  }
}
