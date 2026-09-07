import { Module } from '@nestjs/common';
import { SalaryGridService } from './salary-grid.service.js';
import { SalaryGridController } from './salary-grid.controller.js';

@Module({
  controllers: [SalaryGridController],
  providers: [SalaryGridService],
})
export class SalaryGridModule {}
