import { Module } from '@nestjs/common';
import { VulnerableLabController } from './vulnerable-lab.controller';
import { VulnerableLabService } from './vulnerable-lab.service';

@Module({
  controllers: [VulnerableLabController],
  providers: [VulnerableLabService],
})
export class VulnerableLabModule {}
