import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
  ) {}

  create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantsRepository.create(createTenantDto);
    return this.tenantsRepository.save(tenant);
  }

  findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantsRepository.preload({
      id,
      ...updateTenantDto,
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }
    return this.tenantsRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tenantsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }
  }

  // Placeholder for Stripe integration
  handleStripeWebhook(event: any) {
    // Logic to handle Stripe events like:
    // - 'checkout.session.completed'
    // - 'customer.subscription.updated'
    // - 'customer.subscription.deleted'
    console.log('Received Stripe webhook event:', event.type);
    return { received: true };
  }
}
