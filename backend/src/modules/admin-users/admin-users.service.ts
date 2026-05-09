import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRoleName, UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.user.findMany({
      select: this.safeUserSelect(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listActiveUsers() {
    return this.prisma.user.findMany({
      where: {
        status: UserStatus.active,
      },
      select: this.safeUserSelect(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createUser(admin: AuthUser, dto: CreateAdminUserDto) {
    this.assertAdmin(admin);

    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const role = await this.prisma.role.findUnique({
      where: {
        name: dto.role,
      },
    });

    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash,
        status: dto.status ?? UserStatus.active,
        roleId: role.id,
      },
      select: this.safeUserSelect(),
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: admin.id,
        targetUserId: user.id,
        action: 'user_created',
        entity: 'user',
        entityId: user.id,
        metadata: {
          createdRole: dto.role,
          createdStatus: dto.status ?? UserStatus.active,
          createdByAdminPanel: true,
        },
      },
    });

    return user;
  }

  async updateUserRole(admin: AuthUser, userId: string, dto: UpdateUserRoleDto) {
    this.assertAdmin(admin);

    if (admin.id === userId && dto.role !== UserRoleName.admin) {
      throw new ForbiddenException('Admin cannot remove their own admin role');
    }

    const user = await this.findUserOrFail(userId);

    const role = await this.prisma.role.findUnique({
      where: {
        name: dto.role,
      },
    });

    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        roleId: role.id,
      },
      select: this.safeUserSelect(),
    });

    return updatedUser;
  }

  async updateUserStatus(admin: AuthUser, userId: string, dto: UpdateUserStatusDto) {
    this.assertAdmin(admin);

    if (admin.id === userId && dto.status !== UserStatus.active) {
      throw new ForbiddenException('Admin cannot block or suspend their own account');
    }

    const user = await this.findUserOrFail(userId);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: dto.status,
      },
      select: this.safeUserSelect(),
    });

    if (dto.status === UserStatus.blocked) {
      await this.prisma.auditLog.create({
        data: {
          actorId: admin.id,
          targetUserId: user.id,
          action: 'user_blocked',
          entity: 'user',
          entityId: user.id,
          metadata: {
            previousStatus: user.status,
            nextStatus: dto.status,
          },
        },
      });
    }

    if (dto.status === UserStatus.active && user.status !== UserStatus.active) {
      await this.prisma.auditLog.create({
        data: {
          actorId: admin.id,
          targetUserId: user.id,
          action: 'user_unblocked',
          entity: 'user',
          entityId: user.id,
          metadata: {
            previousStatus: user.status,
            nextStatus: dto.status,
          },
        },
      });
    }

    return updatedUser;
  }

  private async findUserOrFail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private assertAdmin(user: AuthUser) {
    if (user.role !== UserRoleName.admin) {
      throw new ForbiddenException('Admin role required');
    }
  }

  private safeUserSelect() {
    return {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    };
  }
}
