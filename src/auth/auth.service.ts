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
import { PinLoginDto } from './dto/pin-login.dto';
import { PinLoginResponseDto } from './dto/pin-login-response.dto';
import {
  AuthenticatedUser,
  UserProfileResponse,
} from './types/authenticated-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async pinLogin(pinLoginDto: PinLoginDto): Promise<PinLoginResponseDto> {
    const { tenantId, pin } = pinLoginDto;

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

    const payload: AuthenticatedUser = {
      sub: matchedUser.id,
      tenantId: matchedUser.tenantId,
      role: matchedUser.role,
      storeIds: matchedUser.stores.map((s) => s.storeId),
    };

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
      stores: user.stores.map((s) => ({ storeId: s.storeId })),
    };
  }
}
