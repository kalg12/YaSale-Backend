import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { AssignUsersDto } from './dto/assign-users.dto';
import { SetActiveStoreDto } from './dto/set-active-store.dto';

@ApiTags('Stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new store for the current tenant' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.create(user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List stores for the current tenant' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.storesService.findAll(user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.storesService.remove(user.tenantId, id);
  }

  @Post(':id/assign-users')
  @ApiOperation({ summary: 'Assign users to a store (replaces existing list)' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  assignUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUsersDto,
  ) {
    return this.storesService.assignUsers(user.tenantId, id, dto);
  }

  @Patch('active/set')
  @ApiOperation({ summary: 'Set the active store for the current user' })
  setActiveStore(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetActiveStoreDto,
  ) {
    return this.storesService.setActiveStore(user.tenantId, user.sub, dto);
  }
}
