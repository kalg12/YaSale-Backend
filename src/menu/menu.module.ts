import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductVariantGroup } from '../entities/product-variant-group.entity';
import { ProductVariantOption } from '../entities/product-variant-option.entity';
import { ProductModifierGroup } from '../entities/product-modifier-group.entity';
import { ProductModifierOption } from '../entities/product-modifier-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      ProductVariantGroup,
      ProductVariantOption,
      ProductModifierGroup,
      ProductModifierOption,
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
