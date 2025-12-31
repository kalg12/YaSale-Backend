import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PinLoginDto } from './dto/pin-login.dto';
import { PinLoginResponseDto } from './dto/pin-login-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SelectStoreDto } from './dto/select-store.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type {
  AuthenticatedUser,
  UserProfileResponse,
} from './types/authenticated-user.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('pin-login')
  @ApiOperation({ summary: 'Log in with Tenant ID and PIN' })
  async pinLogin(
    @Body() pinLoginDto: PinLoginDto,
  ): Promise<PinLoginResponseDto> {
    return this.authService.pinLogin(pinLoginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileResponse> {
    return await this.authService.getUserProfile(user.sub);
  }

  @Post('select-store')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Select active store for current user and refresh JWT',
  })
  async selectStore(
    @CurrentUser() user: AuthenticatedUser,
    @Body() selectStoreDto: SelectStoreDto,
  ): Promise<PinLoginResponseDto> {
    return this.authService.selectStore(user.sub, user.tenantId, selectStoreDto);
  }
}
