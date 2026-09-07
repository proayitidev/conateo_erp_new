import { Controller, UseGuards } from '@nestjs/common';
import { CftdcService } from './cftdc.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('cftdc')
export class CftdcController {
  constructor(private readonly cftdcService: CftdcService) { }


}
