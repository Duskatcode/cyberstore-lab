import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user, dto);
  }

  @Get('orders')
  listMyOrders(@CurrentUser() user: AuthUser) {
    return this.checkoutService.listMyOrders(user);
  }

  @Get('orders/:id')
  getMyOrder(@CurrentUser() user: AuthUser, @Param('id') orderId: string) {
    return this.checkoutService.getMyOrder(user, orderId);
  }
}
