import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis(process.env.REDIS_URL ?? 'redis://redis:6379', {
          maxRetriesPerRequest: 3,
          lazyConnect: false,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor() {}

  async onApplicationShutdown() {
    // El cierre explícito se hará luego si se centraliza el cliente en un service.
  }
}
