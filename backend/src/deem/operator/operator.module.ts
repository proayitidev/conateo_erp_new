import { Module } from '@nestjs/common';
import { OperatorService } from './operator.service.js';
import { OperatorController } from './operator.controller.js';

@Module({
  controllers: [OperatorController],
  providers: [OperatorService],
})
export class OperatorModule {}
