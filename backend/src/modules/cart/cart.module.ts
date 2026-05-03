import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [RedisModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
