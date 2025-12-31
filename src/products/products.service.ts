import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { Store } from '../entities/store.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    tenantId: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const { storeId, categoryId, ...rest } = createProductDto;

    const store = await this.storeRepository.findOneBy({
      id: storeId,
      tenantId,
    });
    if (!store) {
      throw new UnauthorizedException('Invalid store');
    }

    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
      tenantId,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({
      ...rest,
      storeId,
      categoryId,
      store,
      category,
    });

    return this.productRepository.save(product);
  }

  findAll(tenantId: string, storeId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        storeId,
        store: {
          tenantId,
        },
      },
      relations: ['category'],
    });
  }

  async findOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
        store: {
          tenantId,
        },
      },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async update(
    tenantId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(tenantId, id);

    // Merge the new data
    this.productRepository.merge(product, updateProductDto);

    return this.productRepository.save(product);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
  }
}
