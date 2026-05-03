import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRoleName } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreateProductDto } from './dto/create-product.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  listPublicProducts() {
    return this.productsService.listPublicProducts();
  }

  @Get('products/:slug')
  getPublicProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getPublicProductBySlug(slug);
  }

  @Get('seller/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.seller)
  listSellerProducts(@CurrentUser() user: AuthUser) {
    return this.productsService.listSellerProducts(user);
  }

  @Post('seller/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.seller)
  createSellerProduct(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createSellerProduct(user, dto);
  }

  @Patch('seller/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.seller)
  updateSellerProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateSellerProduct(user, productId, dto);
  }

  @Post('seller/products/:id/request-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.seller)
  requestReview(
    @CurrentUser() user: AuthUser,
    @Param('id') productId: string,
  ) {
    return this.productsService.requestReview(user, productId);
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.admin)
  listAdminProducts() {
    return this.productsService.listAdminProducts();
  }

  @Post('admin/products/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.admin)
  approveProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') productId: string,
    @Body() dto: ModerateProductDto,
  ) {
    return this.productsService.approveProduct(user, productId, dto);
  }

  @Post('admin/products/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.admin)
  rejectProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') productId: string,
    @Body() dto: ModerateProductDto,
  ) {
    return this.productsService.rejectProduct(user, productId, dto);
  }

  @Post('admin/products/:id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleName.admin)
  disableProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') productId: string,
    @Body() dto: ModerateProductDto,
  ) {
    return this.productsService.disableProduct(user, productId, dto);
  }
}
