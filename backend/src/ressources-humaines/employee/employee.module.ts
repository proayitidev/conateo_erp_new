import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service.js';
import { EmployeeController } from './employee.controller.js';
import { FormationModule } from './formation/formation.module.js';
import { AttestationModule } from './attestation/attestation.module.js';
import { RouterModule } from '@nestjs/core';
import { LeavesModule } from './leaves/leaves.module.js';
import { MovementModule } from './movement/movement.module.js';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [LeavesModule, AttestationModule, FormationModule, MovementModule],
})
export class EmployeeModule {}
