import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { UserStore } from '../entities/user-store.entity';
import { PinLoginDto } from './dto/pin-login.dto';
import { PinLoginResponseDto } from './dto/pin-login-response.dto';
import {
  AuthenticatedUser,
  UserProfileResponse,
} from './types/authenticated-user.type';
import { SelectStoreDto } from './dto/select-store.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserStore)
    private userStoresRepository: Repository<UserStore>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  private ensureTenantIsActive(tenant: Tenant) {
    const now = new Date();
    if (
      tenant.subscriptionStatus !== 'ACTIVE' &&
      tenant.subscriptionStatus !== 'TRIALING'
    ) {
      throw new UnauthorizedException('Tenant subscription is not active');
    }
    if (
      tenant.subscriptionStatus === 'TRIALING' &&
      tenant.trialEndsAt &&
      tenant.trialEndsAt.getTime() < now.getTime()
    ) {
      throw new UnauthorizedException('Tenant trial has expired');
    }
  }

  async pinLogin(pinLoginDto: PinLoginDto): Promise<PinLoginResponseDto> {
    const { tenantId, pin } = pinLoginDto;

    const tenant = await this.tenantsRepository.findOneBy({ id: tenantId });
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.ensureTenantIsActive(tenant);

    const users = await this.usersRepository.find({
      where: { tenantId },
      relations: ['stores'],
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let matchedUser: User | null = null;
    for (const user of users) {
      const isPinMatch = await bcrypt.compare(pin, user.pin);
      if (isPinMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const storeIds = matchedUser.stores.map((s) => s.storeId);
    const activeStoreId =
      matchedUser.activeStoreId || storeIds[0] || undefined;

    const payload: AuthenticatedUser = {
      sub: matchedUser.id,
      tenantId: matchedUser.tenantId,
      role: matchedUser.role,
      storeIds,
      activeStoreId,
    };

    if (!matchedUser.activeStoreId && activeStoreId) {
      matchedUser.activeStoreId = activeStoreId;
      await this.usersRepository.save(matchedUser);
    }

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['stores'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      pin: user.pin, // WARNING: Exposing PIN hash. For internal use or debugging only.
      role: user.role,
      isActive: true, // Assuming active if user exists
      activeStoreId: user.activeStoreId,
      stores: user.stores.map((s) => ({ storeId: s.storeId })),
    };
  }

  async selectStore(
    userId: string,
    tenantId: string,
    dto: SelectStoreDto,
  ): Promise<PinLoginResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const assignment = await this.userStoresRepository.findOne({
      where: { userId, storeId: dto.storeId },
    });

    if (!assignment) {
      throw new UnauthorizedException('User does not belong to this store');
    }

    user.activeStoreId = dto.storeId;
    await this.usersRepository.save(user);

    const stores = await this.userStoresRepository.find({
      where: { userId },
    });
    const storeIds = stores.map((s) => s.storeId);

    const payload: AuthenticatedUser = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      storeIds,
      activeStoreId: dto.storeId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
