import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Menu & Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menu/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createProductDto: CreateProductDto,
  ) {
    // TODO: Validate that user has access to the storeId in the DTO
    return this.productsService.create(user.tenantId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products for a store' })
  @ApiQuery({ name: 'storeId', description: 'Filter by Store ID' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.productsService.findAll(user.tenantId, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(user.tenantId, id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.remove(user.tenantId, id);
  }
}
