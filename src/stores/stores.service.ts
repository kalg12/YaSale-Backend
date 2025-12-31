import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { AssignUsersDto } from './dto/assign-users.dto';
import { SetActiveStoreDto } from './dto/set-active-store.dto';
import { Store } from '../entities/store.entity';
import { UserStore } from '../entities/user-store.entity';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(UserStore)
    private readonly userStoresRepository: Repository<UserStore>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
  ) {}

  private ensureTenantIsActive(tenant: Tenant) {
    const now = new Date();
    if (
      tenant.subscriptionStatus !== 'ACTIVE' &&
      tenant.subscriptionStatus !== 'TRIALING'
    ) {
      throw new ForbiddenException('Tenant subscription is not active');
    }
    if (
      tenant.subscriptionStatus === 'TRIALING' &&
      tenant.trialEndsAt &&
      tenant.trialEndsAt.getTime() < now.getTime()
    ) {
      throw new ForbiddenException('Trial period has expired');
    }
  }

  async create(tenantId: string, dto: CreateStoreDto): Promise<Store> {
    const tenant = await this.tenantsRepository.findOneBy({ id: tenantId });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found`);
    }
    this.ensureTenantIsActive(tenant);

    const storeCount = await this.storesRepository.count({ where: { tenantId } });
    if (storeCount >= tenant.maxStores) {
      throw new ForbiddenException('Store limit reached for current plan');
    }

    const store = this.storesRepository.create({
      ...dto,
      tenantId,
      tenant,
    });
    return this.storesRepository.save(store);
  }

  findAll(tenantId: string): Promise<Store[]> {
    return this.storesRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    tenantId: string,
    storeId: string,
    dto: UpdateStoreDto,
  ): Promise<Store> {
    const store = await this.storesRepository.findOneBy({ id: storeId, tenantId });
    if (!store) {
      throw new NotFoundException(`Store with ID '${storeId}' not found`);
    }
    Object.assign(store, dto);
    return this.storesRepository.save(store);
  }

  async remove(tenantId: string, storeId: string): Promise<void> {
    const result = await this.storesRepository.delete({ id: storeId, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Store with ID '${storeId}' not found`);
    }
  }

  async assignUsers(
    tenantId: string,
    storeId: string,
    dto: AssignUsersDto,
  ): Promise<void> {
    const store = await this.storesRepository.findOneBy({ id: storeId, tenantId });
    if (!store) {
      throw new NotFoundException(`Store with ID '${storeId}' not found`);
    }

    const users = await this.usersRepository.find({
      where: { id: In(dto.userIds), tenantId },
    });
    if (users.length !== dto.userIds.length) {
      throw new NotFoundException('One or more users not found for this tenant');
    }

    await this.userStoresRepository.delete({ storeId });

    const userStores = users.map((user) =>
      this.userStoresRepository.create({
        userId: user.id,
        storeId,
        user,
        store,
      }),
    );
    await this.userStoresRepository.save(userStores);
  }

  async setActiveStore(
    tenantId: string,
    userId: string,
    dto: SetActiveStoreDto,
  ): Promise<User> {
    const { storeId } = dto;
    const store = await this.storesRepository.findOneBy({ id: storeId, tenantId });
    if (!store) {
      throw new NotFoundException(`Store with ID '${storeId}' not found`);
    }

    const assignment = await this.userStoresRepository.findOne({
      where: { userId, storeId },
    });
    if (!assignment) {
      throw new ForbiddenException('User is not assigned to this store');
    }

    const user = await this.usersRepository.findOneBy({ id: userId, tenantId });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    user.activeStoreId = storeId;
    await this.usersRepository.save(user);
    return user;
  }
}
