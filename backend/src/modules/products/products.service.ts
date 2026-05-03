import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus, UserRoleName } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreateProductDto } from './dto/create-product.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicProducts() {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.active,
        deletedAt: null,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPublicProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.active,
        deletedAt: null,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async listSellerProducts(user: AuthUser) {
    this.assertSeller(user);

    return this.prisma.product.findMany({
      where: {
        sellerId: user.id,
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createSellerProduct(user: AuthUser, dto: CreateProductDto) {
    this.assertSeller(user);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('Product slug already exists');
    }

    return this.prisma.product.create({
      data: {
        sellerId: user.id,
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        type: dto.type,
        status: ProductStatus.draft,
        priceCents: dto.priceCents,
        currency: dto.currency ?? 'COP',
        stock: dto.stock,
        imageUrl: dto.imageUrl,
      },
      include: {
        category: true,
      },
    });
  }

  async updateSellerProduct(user: AuthUser, productId: string, dto: UpdateProductDto) {
    this.assertSeller(user);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== user.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Invalid category');
      }
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existingSlug = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('Product slug already exists');
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId,
        priceCents: dto.priceCents,
        currency: dto.currency,
        stock: dto.stock,
        imageUrl: dto.imageUrl,
        status: dto.status ?? product.status,
      },
      include: {
        category: true,
      },
    });
  }

  async requestReview(user: AuthUser, productId: string) {
    this.assertSeller(user);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== user.id) {
      throw new ForbiddenException('You can only request review for your own products');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.pending_review,
      },
    });
  }

  async listAdminProducts() {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveProduct(admin: AuthUser, productId: string, dto: ModerateProductDto) {
    this.assertAdmin(admin);

    const product = await this.findProductOrFail(productId);

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.active,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'product_approved',
        entity: 'product',
        entityId: product.id,
        metadata: {
          comment: dto.comment ?? null,
        },
      },
    });

    return updated;
  }

  async rejectProduct(admin: AuthUser, productId: string, dto: ModerateProductDto) {
    this.assertAdmin(admin);

    const product = await this.findProductOrFail(productId);

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.rejected,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'product_rejected',
        entity: 'product',
        entityId: product.id,
        metadata: {
          comment: dto.comment ?? null,
        },
      },
    });

    return updated;
  }

  async disableProduct(admin: AuthUser, productId: string, dto: ModerateProductDto) {
    this.assertAdmin(admin);

    const product = await this.findProductOrFail(productId);

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.inactive,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'product_disabled',
        entity: 'product',
        entityId: product.id,
        metadata: {
          comment: dto.comment ?? null,
        },
      },
    });

    return updated;
  }

  private async findProductOrFail(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private assertSeller(user: AuthUser) {
    if (user.role !== UserRoleName.seller) {
      throw new ForbiddenException('Seller role required');
    }
  }

  private assertAdmin(user: AuthUser) {
    if (user.role !== UserRoleName.admin) {
      throw new ForbiddenException('Admin role required');
    }
  }
}
