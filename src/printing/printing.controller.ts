import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PrintingService } from './printing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePrinterConfigDto } from './dto/create-printer-config.dto';
import { UpdatePrinterConfigDto } from './dto/update-printer-config.dto';
import { CreatePrintJobDto } from './dto/create-print-job.dto';

@ApiTags('Printing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('printing')
export class PrintingController {
  constructor(private readonly printingService: PrintingService) {}

  @Post('configs')
  @ApiOperation({ summary: 'Create printer configuration for a store' })
  createConfig(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePrinterConfigDto,
  ) {
    return this.printingService.createConfig(user.tenantId, dto);
  }

  @Get('configs')
  @ApiOperation({ summary: 'List printer configs for tenant (optional store filter)' })
  @ApiQuery({ name: 'storeId', required: false })
  listConfigs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('storeId') storeId?: string,
  ) {
    const targetStoreId = storeId || user.activeStoreId;
    if (!targetStoreId) {
      throw new BadRequestException('storeId is required');
    }
    return this.printingService.listConfigs(user.tenantId, targetStoreId);
  }

  @Patch('configs/:id')
  @ApiOperation({ summary: 'Update a printer configuration' })
  @ApiParam({ name: 'id', description: 'Printer config ID' })
  updateConfig(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrinterConfigDto,
  ) {
    return this.printingService.updateConfig(user.tenantId, id, dto);
  }

  @Delete('configs/:id')
  @ApiOperation({ summary: 'Delete a printer configuration' })
  @ApiParam({ name: 'id', description: 'Printer config ID' })
  removeConfig(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.printingService.removeConfig(user.tenantId, id);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Queue a print job (reprint/send to kitchen)' })
  createJob(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePrintJobDto,
  ) {
    if (!dto.storeId) {
      if (!user.activeStoreId) {
        throw new BadRequestException('storeId is required');
      }
      dto.storeId = user.activeStoreId;
    }
    return this.printingService.enqueueJob(user.tenantId, dto);
  }

  @Post('jobs/:id/retry')
  @ApiOperation({ summary: 'Retry a print job' })
  @ApiParam({ name: 'id', description: 'Print job ID' })
  retryJob(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.printingService.retryJob(user.tenantId, id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List print jobs' })
  @ApiQuery({ name: 'storeId', required: false })
  listJobs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('storeId') storeId?: string,
  ) {
    const targetStoreId = storeId || user.activeStoreId;
    if (!targetStoreId) {
      throw new BadRequestException('storeId is required');
    }
    return this.printingService.listJobs(user.tenantId, targetStoreId);
  }

  @Post('reprint/order/:orderId')
  @ApiOperation({ summary: 'Reprint an order to the active printer of the store' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  reprintOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.printingService.reprintOrder(user.tenantId, orderId);
  }
}
