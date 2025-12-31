import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ChecksService } from './checks.service';
import { CreateCheckDto } from './dto/create-check.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { AddOrderToCheckDto } from './dto/add-order-to-check.dto';
import { CloseCheckDto } from './dto/close-check.dto';
// CORRECCIÓN: Se agrega "type" a la importación
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Checks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new open check' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createCheckDto: CreateCheckDto,
  ) {
    if (!createCheckDto.storeId) {
      if (!user.activeStoreId) {
        throw new BadRequestException('storeId is required');
      }
      createCheckDto.storeId = user.activeStoreId;
    }
    return this.checksService.create(user.tenantId, user.sub, createCheckDto);
  }

  @Get('open/:storeId')
  @ApiOperation({ summary: 'Get all open checks for a store' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  findOpenByStore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.checksService.findOpenByStore(user.tenantId, storeId);
  }

  @Post(':id/add-order')
  @ApiOperation({ summary: 'Add an order to an open check' })
  @ApiParam({ name: 'id', description: 'Check ID' })
  addOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addOrderToCheckDto: AddOrderToCheckDto,
  ) {
    return this.checksService.addOrder(user.tenantId, id, addOrderToCheckDto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a check and record payment' })
  @ApiParam({ name: 'id', description: 'Check ID' })
  close(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() closeCheckDto: CloseCheckDto,
  ) {
    return this.checksService.close(user.tenantId, id, closeCheckDto);
  }
}
