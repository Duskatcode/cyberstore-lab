import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ProductStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import type { AuthUser } from '../auth/types/auth-user.type';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import type { Cart, CartItem, CartView } from './types/cart.types';

const CART_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getCart(user: AuthUser): Promise<CartView> {
    const cart = await this.readCart(user.id);
    return this.toCartView(cart);
  }

  async addItem(user: AuthUser, dto: AddCartItemDto): Promise<CartView> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        status: ProductStatus.active,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.readCart(user.id);
    const existingItem = cart.items.find((item) => item.productId === dto.productId);
    const now = new Date().toISOString();

    if (existingItem) {
      const nextQuantity = existingItem.quantity + dto.quantity;

      if (product.stock < nextQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      existingItem.quantity = nextQuantity;
      existingItem.updatedAt = now;
    } else {
      cart.items.push({
        productId: dto.productId,
        quantity: dto.quantity,
        addedAt: now,
        updatedAt: now,
      });
    }

    cart.updatedAt = now;

    await this.writeCart(cart);

    return this.toCartView(cart);
  }

  async updateItem(
    user: AuthUser,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartView> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        status: ProductStatus.active,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.readCart(user.id);
    const item = cart.items.find((cartItem) => cartItem.productId === productId);

    if (!item) {
      throw new NotFoundException('Product is not in cart');
    }

    item.quantity = dto.quantity;
    item.updatedAt = new Date().toISOString();
    cart.updatedAt = new Date().toISOString();

    await this.writeCart(cart);

    return this.toCartView(cart);
  }

  async removeItem(user: AuthUser, productId: string): Promise<CartView> {
    const cart = await this.readCart(user.id);
    const initialLength = cart.items.length;

    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      throw new NotFoundException('Product is not in cart');
    }

    cart.updatedAt = new Date().toISOString();

    await this.writeCart(cart);

    return this.toCartView(cart);
  }

  async clearCart(user: AuthUser) {
    await this.redis.del(this.getCartKey(user.id));

    return {
      success: true,
    };
  }

  private getCartKey(userId: string): string {
    return `cart:user:${userId}`;
  }

  private async readCart(userId: string): Promise<Cart> {
    const key = this.getCartKey(userId);
    const rawCart = await this.redis.get(key);

    if (!rawCart) {
      return {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      return JSON.parse(rawCart) as Cart;
    } catch {
      await this.redis.del(key);

      return {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }
  }

  private async writeCart(cart: Cart): Promise<void> {
    await this.redis.set(
      this.getCartKey(cart.userId),
      JSON.stringify(cart),
      'EX',
      CART_TTL_SECONDS,
    );
  }

  private async toCartView(cart: Cart): Promise<CartView> {
    const productIds = cart.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        status: ProductStatus.active,
        deletedAt: null,
      },
    });

    const productsById = new Map(products.map((product) => [product.id, product]));
    const validItems: CartItem[] = [];

    const viewItems = cart.items
      .map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          return null;
        }

        validItems.push(item);

        return {
          ...item,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            priceCents: product.priceCents,
            currency: product.currency,
            stock: product.stock,
            imageUrl: product.imageUrl,
          },
          subtotalCents: product.priceCents * item.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      cart.updatedAt = new Date().toISOString();
      await this.writeCart(cart);
    }

    const totalCents = viewItems.reduce((sum, item) => sum + item.subtotalCents, 0);
    const ttlSeconds = await this.redis.ttl(this.getCartKey(cart.userId));

    return {
      userId: cart.userId,
      items: viewItems,
      totalCents,
      currency: viewItems[0]?.product.currency ?? 'COP',
      ttlSeconds,
    };
  }
}
