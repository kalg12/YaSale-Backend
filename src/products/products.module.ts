import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Store } from '../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Store])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
