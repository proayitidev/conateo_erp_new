import { Module } from '@nestjs/common';
import { FacturationService } from './facturation.service.js';
import { FacturationController } from './facturation.controller.js';

@Module({
  controllers: [FacturationController],
  providers: [FacturationService],
})
export class FacturationModule {}
