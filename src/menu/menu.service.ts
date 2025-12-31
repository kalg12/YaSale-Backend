import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductVariantGroup } from '../entities/product-variant-group.entity';
import { ProductVariantOption } from '../entities/product-variant-option.entity';
import { ProductModifierGroup } from '../entities/product-modifier-group.entity';
import { ProductModifierOption } from '../entities/product-modifier-option.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateVariantGroupDto } from './dto/create-variant-group.dto';
import { UpdateVariantGroupDto } from './dto/update-variant-group.dto';
import { CreateVariantOptionDto } from './dto/create-variant-option.dto';
import { UpdateVariantOptionDto } from './dto/update-variant-option.dto';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';
import { UpdateModifierGroupDto } from './dto/update-modifier-group.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { UpdateModifierOptionDto } from './dto/update-modifier-option.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariantGroup)
    private readonly variantGroupsRepository: Repository<ProductVariantGroup>,
    @InjectRepository(ProductVariantOption)
    private readonly variantOptionsRepository: Repository<ProductVariantOption>,
    @InjectRepository(ProductModifierGroup)
    private readonly modifierGroupsRepository: Repository<ProductModifierGroup>,
    @InjectRepository(ProductModifierOption)
    private readonly modifierOptionsRepository: Repository<ProductModifierOption>,
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

  // Categories
  createCategory(
    tenantId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      tenantId,
    });
    return this.categoriesRepository.save(category);
  }

  findCategories(tenantId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { tenantId },
      order: { sortOrder: 'ASC' },
    });
  }

  async updateCategory(
    tenantId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({
      id,
      tenantId,
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async removeCategory(tenantId: string, id: string): Promise<void> {
    const result = await this.categoriesRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
  }

  // Variant Groups and Options
  async createVariantGroup(
    tenantId: string,
    dto: CreateVariantGroupDto,
  ): Promise<ProductVariantGroup> {
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId, store: { tenantId } },
      relations: ['store'],
    });
    if (!product) {
      throw new NotFoundException('Product not found for this tenant');
    }

    const group = this.variantGroupsRepository.create({
      ...dto,
      product,
    });
    return this.variantGroupsRepository.save(group);
  }

  async updateVariantGroup(
    tenantId: string,
    id: string,
    dto: UpdateVariantGroupDto,
  ): Promise<ProductVariantGroup> {
    const group = await this.variantGroupsRepository.findOne({
      where: { id, product: { store: { tenantId } } },
      relations: ['product', 'product.store'],
    });
    if (!group) {
      throw new NotFoundException(`Variant group with ID '${id}' not found`);
    }
    Object.assign(group, dto);
    return this.variantGroupsRepository.save(group);
  }

  async removeVariantGroup(tenantId: string, id: string): Promise<void> {
    const group = await this.variantGroupsRepository.findOne({
      where: { id, product: { store: { tenantId } } },
      relations: ['product', 'product.store'],
    });
    if (!group) {
      throw new NotFoundException(`Variant group with ID '${id}' not found`);
    }
    await this.variantGroupsRepository.delete(id);
  }

  async createVariantOption(
    tenantId: string,
    dto: CreateVariantOptionDto,
  ): Promise<ProductVariantOption> {
    const group = await this.variantGroupsRepository.findOne({
      where: { id: dto.variantGroupId, product: { store: { tenantId } } },
      relations: ['product', 'product.store'],
    });
    if (!group) {
      throw new NotFoundException('Variant group not found for this tenant');
    }

    const option = this.variantOptionsRepository.create({
      ...dto,
      variantGroup: group,
    });
    return this.variantOptionsRepository.save(option);
  }

  async updateVariantOption(
    tenantId: string,
    id: string,
    dto: UpdateVariantOptionDto,
  ): Promise<ProductVariantOption> {
    const option = await this.variantOptionsRepository.findOne({
      where: { id, variantGroup: { product: { store: { tenantId } } } },
      relations: ['variantGroup', 'variantGroup.product', 'variantGroup.product.store'],
    });
    if (!option) {
      throw new NotFoundException(`Variant option with ID '${id}' not found`);
    }
    Object.assign(option, dto);
    return this.variantOptionsRepository.save(option);
  }

  async removeVariantOption(tenantId: string, id: string): Promise<void> {
    const option = await this.variantOptionsRepository.findOne({
      where: { id, variantGroup: { product: { store: { tenantId } } } },
      relations: ['variantGroup', 'variantGroup.product', 'variantGroup.product.store'],
    });
    if (!option) {
      throw new NotFoundException(`Variant option with ID '${id}' not found`);
    }
    await this.variantOptionsRepository.delete(id);
  }

  // Modifier Groups and Options
  async createModifierGroup(
    tenantId: string,
    dto: CreateModifierGroupDto,
  ): Promise<ProductModifierGroup> {
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId, store: { tenantId } },
      relations: ['store'],
    });
    if (!product) {
      throw new NotFoundException('Product not found for this tenant');
    }

    const group = this.modifierGroupsRepository.create({
      ...dto,
      product,
    });
    return this.modifierGroupsRepository.save(group);
  }

  async updateModifierGroup(
    tenantId: string,
    id: string,
    dto: UpdateModifierGroupDto,
  ): Promise<ProductModifierGroup> {
    const group = await this.modifierGroupsRepository.findOne({
      where: { id, product: { store: { tenantId } } },
      relations: ['product', 'product.store'],
    });
    if (!group) {
      throw new NotFoundException(`Modifier group with ID '${id}' not found`);
    }
    Object.assign(group, dto);
    return this.modifierGroupsRepository.save(group);
  }

  async removeModifierGroup(tenantId: string, id: string): Promise<void> {
    const group = await this.modifierGroupsRepository.findOne({
      where: { id, product: { store: { tenantId } } },
      relations: ['product', 'product.store'],
    });
    if (!group) {
      throw new NotFoundException(`Modifier group with ID '${id}' not found`);
    }
    await this.modifierGroupsRepository.delete(id);
  }

  async createModifierOption(
    tenantId: string,
    dto: CreateModifierOptionDto,
  ): Promise<ProductModifierOption> {
    const group = await this.modifierGroupsRepository.findOne({
      where: { id: dto.modifierGroupId, product: { store: { tenantId } } },
      relations: ['product', 'product.store'],
    });
    if (!group) {
      throw new NotFoundException('Modifier group not found for this tenant');
    }

    const option = this.modifierOptionsRepository.create({
      ...dto,
      modifierGroup: group,
    });
    return this.modifierOptionsRepository.save(option);
  }

  async updateModifierOption(
    tenantId: string,
    id: string,
    dto: UpdateModifierOptionDto,
  ): Promise<ProductModifierOption> {
    const option = await this.modifierOptionsRepository.findOne({
      where: { id, modifierGroup: { product: { store: { tenantId } } } },
      relations: ['modifierGroup', 'modifierGroup.product', 'modifierGroup.product.store'],
    });
    if (!option) {
      throw new NotFoundException(`Modifier option with ID '${id}' not found`);
    }
    Object.assign(option, dto);
    return this.modifierOptionsRepository.save(option);
  }

  async removeModifierOption(tenantId: string, id: string): Promise<void> {
    const option = await this.modifierOptionsRepository.findOne({
      where: { id, modifierGroup: { product: { store: { tenantId } } } },
      relations: ['modifierGroup', 'modifierGroup.product', 'modifierGroup.product.store'],
    });
    if (!option) {
      throw new NotFoundException(`Modifier option with ID '${id}' not found`);
    }
    await this.modifierOptionsRepository.delete(id);
  }
}
