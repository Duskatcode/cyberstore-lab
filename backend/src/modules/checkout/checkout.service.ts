import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import Redis from 'ioredis';
import {
  OrderStatus,
  ProductStatus,
  StockMovementType,
  UserRoleName,
} from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CheckoutDto } from './dto/checkout.dto';

type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
  updatedAt: string;
};

type Cart = {
  userId: string;
  items: CartItem[];
  updatedAt: string;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async checkout(user: AuthUser, dto: CheckoutDto) {
    if (user.role !== UserRoleName.customer) {
      throw new ForbiddenException('Customer role required');
    }

    const cartKey = this.getCartKey(user.id);
    const cart = await this.readCart(cartKey, user.id);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const productIds = cart.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: ProductStatus.active,
        deletedAt: null,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Cart contains unavailable products');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));

    const normalizedItems = cart.items.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new BadRequestException('Product not available');
      }

      if (item.quantity < 1) {
        throw new BadRequestException('Invalid quantity');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      return {
        cartItem: item,
        product,
        subtotalCents: product.priceCents * item.quantity,
      };
    });

    const totalCents = normalizedItems.reduce(
      (sum, item) => sum + item.subtotalCents,
      0,
    );

    const paymentSuccess = dto.paymentSuccess ?? true;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          customerId: user.id,
          status: OrderStatus.pending,
          totalCents,
          currency: normalizedItems[0]?.product.currency ?? 'COP',
          statusHistory: {
            create: {
              status: OrderStatus.pending,
              comment: 'Order created from Redis cart',
            },
          },
        },
      });

      if (!paymentSuccess) {
        const failedOrder = await tx.order.update({
          where: { id: createdOrder.id },
          data: {
            status: OrderStatus.payment_failed,
            statusHistory: {
              create: {
                status: OrderStatus.payment_failed,
                comment: dto.paymentReference ?? 'Simulated payment failed',
              },
            },
          },
          include: {
            items: true,
            statusHistory: true,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: 'order_created',
            entity: 'order',
            entityId: failedOrder.id,
            metadata: {
              paymentSuccess: false,
              paymentReference: dto.paymentReference ?? null,
            },
          },
        });

        return failedOrder;
      }

      for (const item of normalizedItems) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.product.id,
            stock: {
              gte: item.cartItem.quantity,
            },
            status: ProductStatus.active,
            deletedAt: null,
          },
          data: {
            stock: {
              decrement: item.cartItem.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
        }

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.product.id,
            sellerId: item.product.sellerId,
            productNameSnapshot: item.product.name,
            productSlugSnapshot: item.product.slug,
            productTypeSnapshot: item.product.type,
            productImageSnapshot: item.product.imageUrl,
            unitPriceCents: item.product.priceCents,
            quantity: item.cartItem.quantity,
            subtotalCents: item.subtotalCents,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.product.id,
            type: StockMovementType.out,
            quantity: item.cartItem.quantity,
            reason: 'checkout_paid',
            orderId: createdOrder.id,
          },
        });
      }

      const paidOrder = await tx.order.update({
        where: { id: createdOrder.id },
        data: {
          status: OrderStatus.paid,
          statusHistory: {
            create: {
              status: OrderStatus.paid,
              comment: dto.paymentReference ?? 'Simulated payment success',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'order_paid',
          entity: 'order',
          entityId: paidOrder.id,
          metadata: {
            paymentSuccess: true,
            paymentReference: dto.paymentReference ?? null,
            totalCents,
          },
        },
      });

      return paidOrder;
    });

    if (order.status === OrderStatus.paid) {
      await this.redis.del(cartKey);
    }

    return order;
  }

  async listMyOrders(user: AuthUser) {
    if (user.role !== UserRoleName.customer) {
      throw new ForbiddenException('Customer role required');
    }

    return this.prisma.order.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        items: true,
        statusHistory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMyOrder(user: AuthUser, orderId: string) {
    if (user.role !== UserRoleName.customer) {
      throw new ForbiddenException('Customer role required');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: user.id,
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  private getCartKey(userId: string): string {
    return `cart:user:${userId}`;
  }

  private async readCart(cartKey: string, userId: string): Promise<Cart> {
    const rawCart = await this.redis.get(cartKey);

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
      await this.redis.del(cartKey);

      return {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }
  }
}
