import { Controller, Get, UseGuards } from '@nestjs/common';
import { PersonalManagementService } from './personal-management.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { GetUser } from '../auth/decorators/getUser.decorator.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('personal-management')
export class PersonalManagementController {
  constructor(
    private readonly personalManagementService: PersonalManagementService,
  ) { }
  @Get('status_kpis')
  getStatusKPIs(@GetUser('id') userId: number) {
    console.log("the kipis")
    return this.personalManagementService.getStatusKPIs(userId);
  }
}
