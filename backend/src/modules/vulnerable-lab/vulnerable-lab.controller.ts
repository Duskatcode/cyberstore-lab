import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VerboseLoginDto } from './dto/verbose-login.dto';
import { VulnerableLabService } from './vulnerable-lab.service';

@Controller('lab/vulnerable')
export class VulnerableLabController {
  constructor(private readonly vulnerableLabService: VulnerableLabService) {}

  @Get('info')
  getInfo() {
    return this.vulnerableLabService.getInfo();
  }

  @Post('verbose-login')
  verboseLogin(@Body() dto: VerboseLoginDto) {
    return this.vulnerableLabService.verboseLogin(dto);
  }

  @Get('orders/:id')
  getAnyOrder(@Param('id') orderId: string) {
    return this.vulnerableLabService.getAnyOrder(orderId);
  }

  @Get('sql-products-search')
  unsafeProductSearch(@Query('term') term?: string) {
    return this.vulnerableLabService.unsafeProductSearch(term);
  }

  @Get('reflected')
  reflected(@Query('message') message?: string) {
    return this.vulnerableLabService.reflected(message);
  }
}
