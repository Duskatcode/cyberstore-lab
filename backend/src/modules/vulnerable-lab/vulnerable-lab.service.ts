import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { VerboseLoginDto } from './dto/verbose-login.dto';

@Injectable()
export class VulnerableLabService {
  constructor(private readonly prisma: PrismaService) {}

  ensureEnabled() {
    if (process.env.ENABLE_VULNERABLE_LAB !== 'true') {
      throw new NotFoundException('Not found');
    }
  }

  getInfo() {
    this.ensureEnabled();

    return {
      enabled: true,
      warning: 'This module is intentionally vulnerable and must only run in a local lab.',
      routes: [
        'GET /api/v1/lab/vulnerable/info',
        'POST /api/v1/lab/vulnerable/verbose-login',
        'GET /api/v1/lab/vulnerable/orders/:id',
        'GET /api/v1/lab/vulnerable/sql-products-search?term=...',
        'GET /api/v1/lab/vulnerable/reflected?message=...',
      ],
    };
  }

  async verboseLogin(dto: VerboseLoginDto) {
    this.ensureEnabled();

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return {
        ok: false,
        reason: 'email_not_registered',
        vulnerableBehavior: 'User enumeration through verbose login errors.',
      };
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      return {
        ok: false,
        reason: 'wrong_password_for_existing_user',
        vulnerableBehavior: 'User enumeration through verbose login errors.',
      };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        status: user.status,
      },
      vulnerableBehavior: 'Overly verbose authentication response.',
    };
  }

  async getAnyOrder(orderId: string) {
    this.ensureEnabled();

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: true,
        statusHistory: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      vulnerableBehavior: 'Broken access control: no ownership check is applied.',
      order,
    };
  }

  async unsafeProductSearch(term = '') {
    this.ensureEnabled();

    const query = `
      SELECT id, name, slug, price_cents, stock
      FROM products
      WHERE deleted_at IS NULL
        AND name ILIKE '%${term}%'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const rows = await this.prisma.$queryRawUnsafe(query);

    return {
      vulnerableBehavior: 'Unsafe raw SQL query built with string interpolation.',
      rows,
    };
  }

  reflected(message = '') {
    this.ensureEnabled();

    return {
      vulnerableBehavior: 'Reflected untrusted input. Dangerous if rendered as HTML by a client.',
      message,
      unsafeHtml: `<div>${message}</div>`,
    };
  }
}
