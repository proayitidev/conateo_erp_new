import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  GroupByCriteria,
  RessourcesHumainesService,
} from './ressources-humaines.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { Prisma } from '../utils/prisma/client.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class RessourcesHumainesController {
  constructor(
    private readonly ressourcesHumainesService: RessourcesHumainesService,
  ) {}

  @Get('kpis')
  getKpis() {
    return this.ressourcesHumainesService.getKpis();
  }

  @Get('countBy/:by')
  countBy(@Param('by') by: Prisma.EmployeeScalarFieldEnum | GroupByCriteria) {
    return this.ressourcesHumainesService.countBy(by);
  }
}
