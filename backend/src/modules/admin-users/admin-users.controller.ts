import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRoleName } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleName.admin)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers() {
    return this.adminUsersService.listUsers();
  }

  @Get('active')
  listActiveUsers() {
    return this.adminUsersService.listActiveUsers();
  }

  @Post()
  createUser(@CurrentUser() admin: AuthUser, @Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.createUser(admin, dto);
  }

  @Patch(':id/role')
  updateUserRole(
    @CurrentUser() admin: AuthUser,
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminUsersService.updateUserRole(admin, userId, dto);
  }

  @Patch(':id/status')
  updateUserStatus(
    @CurrentUser() admin: AuthUser,
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateUserStatus(admin, userId, dto);
  }
}
