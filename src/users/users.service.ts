import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserStore } from '../entities/user-store.entity';
import { Store } from '../entities/store.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStore)
    private readonly userStoreRepository: Repository<UserStore>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(tenantId: string, createUserDto: CreateUserDto): Promise<User> {
    const { name, pin, role, storeIds } = createUserDto;
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
