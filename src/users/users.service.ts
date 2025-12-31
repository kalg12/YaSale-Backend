import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserStore } from '../entities/user-store.entity';
import { Store } from '../entities/store.entity';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStore)
    private readonly userStoreRepository: Repository<UserStore>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
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
      throw new ForbiddenException('Tenant trial has expired');
    }
  }

  async create(tenantId: string, createUserDto: CreateUserDto): Promise<User> {
    const { name, pin, role, storeIds } = createUserDto;
    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found`);
    }
    this.ensureTenantIsActive(tenant);

    const userCount = await this.userRepository.count({ where: { tenantId } });
    if (userCount >= tenant.maxUsers) {
      throw new ForbiddenException('User limit reached for current plan');
    }
    const hashedPassword = await bcrypt.hash(pin, 10);

    // Verify stores exist
    const stores = await this.storeRepository.find({
      where: { id: In(storeIds), tenantId },
    });
    if (stores.length !== storeIds.length) {
      throw new NotFoundException('One or more stores not found');
    }

    const user = this.userRepository.create({
      name,
      pin: hashedPassword,
      role,
      tenantId,
      activeStoreId: storeIds[0],
    });

    const savedUser = await this.userRepository.save(user);

    const userStores = stores.map((store) =>
      this.userStoreRepository.create({
        user: savedUser,
        store,
      }),
    );
    await this.userStoreRepository.save(userStores);

    return this.findOne(tenantId, savedUser.id);
  }

  findAll(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
      relations: ['stores', 'stores.store'],
      select: {
        id: true,
        name: true,
        role: true,
        activeStoreId: true,
        stores: {
          id: true,
          store: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['stores', 'stores.store'],
      select: {
        id: true,
        name: true,
        role: true,
        activeStoreId: true,
        stores: {
          id: true,
          store: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  async update(
    tenantId: string,
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id, tenantId });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    const { pin, storeIds, ...rest } = updateUserDto;

    Object.assign(user, rest);

    if (pin) {
      user.pin = await bcrypt.hash(pin, 10);
    }

    if (storeIds) {
      // Remove existing associations
      await this.userStoreRepository.delete({ userId: id });
      // Add new associations
      const stores = await this.storeRepository.find({
        where: { id: In(storeIds), tenantId },
      });
      if (stores.length !== storeIds.length) {
        throw new NotFoundException('One or more stores not found');
      }
      if (!user.activeStoreId || !storeIds.includes(user.activeStoreId)) {
        user.activeStoreId = storeIds[0];
      }
      const userStores = stores.map((store) =>
        this.userStoreRepository.create({
          user,
          store,
        }),
      );
      await this.userStoreRepository.save(userStores);
    }

    await this.userRepository.save(user);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.userRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
  }
}
