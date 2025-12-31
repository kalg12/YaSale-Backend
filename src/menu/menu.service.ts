import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async getFullMenu(tenantId: string, storeId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: {
        tenantId,
        products: {
          storeId,
          isActive: true,
        },
      },
      relations: [
        'products',
        'products.variantGroups',
        'products.variantGroups.options',
        'products.modifierGroups',
        'products.modifierGroups.options',
      ],
      order: {
        sortOrder: 'ASC',
        products: {
          sortOrder: 'ASC',
          variantGroups: {
            sortOrder: 'ASC',
            options: {
              sortOrder: 'ASC',
            },
          },
          modifierGroups: {
            sortOrder: 'ASC',
            options: {
              sortOrder: 'ASC',
            },
          },
        },
      },
    });
  }
}
