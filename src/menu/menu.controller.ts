import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
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

@ApiTags('Menu & Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Categories
  @Post('categories')
  @ApiOperation({ summary: 'Create a category' })
  createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.menuService.createCategory(user.tenantId, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  listCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.menuService.findCategories(user.tenantId);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  updateCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(user.tenantId, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  deleteCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.menuService.removeCategory(user.tenantId, id);
  }

  // Variant Groups & Options
  @Post('variant-groups')
  @ApiOperation({ summary: 'Create a variant group for a product' })
  createVariantGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVariantGroupDto,
  ) {
    return this.menuService.createVariantGroup(user.tenantId, dto);
  }

  @Patch('variant-groups/:id')
  @ApiOperation({ summary: 'Update a variant group' })
  @ApiParam({ name: 'id', description: 'Variant group ID' })
  updateVariantGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVariantGroupDto,
  ) {
    return this.menuService.updateVariantGroup(user.tenantId, id, dto);
  }

  @Delete('variant-groups/:id')
  @ApiOperation({ summary: 'Delete a variant group' })
  @ApiParam({ name: 'id', description: 'Variant group ID' })
  deleteVariantGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.menuService.removeVariantGroup(user.tenantId, id);
  }

  @Post('variant-options')
  @ApiOperation({ summary: 'Create a variant option' })
  createVariantOption(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVariantOptionDto,
  ) {
    return this.menuService.createVariantOption(user.tenantId, dto);
  }

  @Patch('variant-options/:id')
  @ApiOperation({ summary: 'Update a variant option' })
  @ApiParam({ name: 'id', description: 'Variant option ID' })
  updateVariantOption(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVariantOptionDto,
  ) {
    return this.menuService.updateVariantOption(user.tenantId, id, dto);
  }

  @Delete('variant-options/:id')
  @ApiOperation({ summary: 'Delete a variant option' })
  @ApiParam({ name: 'id', description: 'Variant option ID' })
  deleteVariantOption(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.menuService.removeVariantOption(user.tenantId, id);
  }

  // Modifier Groups & Options
  @Post('modifier-groups')
  @ApiOperation({ summary: 'Create a modifier group for a product' })
  createModifierGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateModifierGroupDto,
  ) {
    return this.menuService.createModifierGroup(user.tenantId, dto);
  }

  @Patch('modifier-groups/:id')
  @ApiOperation({ summary: 'Update a modifier group' })
  @ApiParam({ name: 'id', description: 'Modifier group ID' })
  updateModifierGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.menuService.updateModifierGroup(user.tenantId, id, dto);
  }

  @Delete('modifier-groups/:id')
  @ApiOperation({ summary: 'Delete a modifier group' })
  @ApiParam({ name: 'id', description: 'Modifier group ID' })
  deleteModifierGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.menuService.removeModifierGroup(user.tenantId, id);
  }

  @Post('modifier-options')
  @ApiOperation({ summary: 'Create a modifier option' })
  createModifierOption(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateModifierOptionDto,
  ) {
    return this.menuService.createModifierOption(user.tenantId, dto);
  }

  @Patch('modifier-options/:id')
  @ApiOperation({ summary: 'Update a modifier option' })
  @ApiParam({ name: 'id', description: 'Modifier option ID' })
  updateModifierOption(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModifierOptionDto,
  ) {
    return this.menuService.updateModifierOption(user.tenantId, id, dto);
  }

  @Delete('modifier-options/:id')
  @ApiOperation({ summary: 'Delete a modifier option' })
  @ApiParam({ name: 'id', description: 'Modifier option ID' })
  deleteModifierOption(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.menuService.removeModifierOption(user.tenantId, id);
  }

  @Get(':storeId')
  @ApiOperation({ summary: 'Get the full, structured menu for a store' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  getFullMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    // TODO: Validate that the user has access to this storeId
    return this.menuService.getFullMenu(user.tenantId, storeId);
  }
}
