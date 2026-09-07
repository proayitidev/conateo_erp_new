import { Module } from '@nestjs/common';
import { LeavePolicyService } from './leave-policy.service.js';
import { LeavePolicyController } from './leave-policy.controller.js';

@Module({
  controllers: [LeavePolicyController],
  providers: [LeavePolicyService],
})
export class LeavePolicyModule { }
