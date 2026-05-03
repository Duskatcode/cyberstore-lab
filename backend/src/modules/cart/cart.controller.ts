import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getCart(user);
  }

  @Post('items')
  addItem(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user, productId, dto);
  }

  @Delete('items/:productId')
  removeItem(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.cartService.removeItem(user, productId);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthUser) {
    return this.cartService.clearCart(user);
  }
}
