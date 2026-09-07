import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DeemService } from './deem.service.js';
import { $Enums } from '../utils/prisma/client.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('deem')
export class DeemController {
  constructor(private readonly deemService: DeemService) { }

  @Get('kpis')
  kpis() {
    return this.deemService.kpis();
  }

  @Get('total_by_operator')
  totalByOperator() {
    return this.deemService.totalByOperator();
  }

  @Get('total_by_type')
  totalByType() {
    return this.deemService.totalByType();
  }
  @Get('price_comp_by_op')
  priceCompByOp(@Query('callType') callType?: $Enums.CallType) {
    return this.deemService.priceCompByOp(callType);
  }
  @Get('price_comp_by_call_type')
  priceCompByCallType(@Query('operatorName') operatorName?: string) {
    return this.deemService.priceCompByCallType(operatorName);
  }
}
