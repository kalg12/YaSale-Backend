import {
  Controller,
  Get,
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

@ApiTags('Menu & Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

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
