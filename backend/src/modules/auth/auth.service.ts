import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { UserRoleName, UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type RefreshPayload = {
  sub: string;
  email: string;
  jti: string;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const customerRole = await this.prisma.role.findUnique({
      where: { name: UserRoleName.customer },
    });

    if (!customerRole) {
      throw new InternalServerErrorException('Customer role is not seeded');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        status: UserStatus.active,
        roleId: customerRole.id,
      },
      include: { role: true },
    });

    const tokens = await this.issueTokenPair(user.id, user.email, user.role.name);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });

    if (!user || user.status !== UserStatus.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokenPair(user.id, user.email, user.role.name);

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'user_login',
        entity: 'user',
        entityId: user.id,
      },
    });

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      storedToken.user.status !== UserStatus.active ||
      storedToken.userId !== payload.sub
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokenPair(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role.name,
      storedToken.id,
    );

    return {
      user: this.toPublicUser(storedToken.user),
      ...tokens,
    };
  }

  async logout(dto: LogoutDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken && !storedToken.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
    }

    return {
      success: true,
    };
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: UserRoleName,
    replacedTokenId?: string,
  ): Promise<TokenPair> {
    const refreshJti = randomUUID();

    const accessExpiresIn = (
      process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'
    ) as JwtSignOptions['expiresIn'];

    const refreshExpiresIn = (
      process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
    ) as JwtSignOptions['expiresIn'];

    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        role,
        type: 'access',
      },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
        expiresIn: accessExpiresIn,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        jti: refreshJti,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
        expiresIn: refreshExpiresIn,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.getRefreshExpiryDate(),
        replacedById: replacedTokenId,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshExpiryDate(): Date {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    const ms = this.durationToMs(expiresIn);

    return new Date(Date.now() + ms);
  }

  private durationToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string;
    status: UserStatus;
    role: { name: UserRoleName };
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      role: user.role.name,
    };
  }
}
