import { Module } from '@nestjs/common';
import { AffectationService } from './affectation.service.js';
import { AffectationController } from './affectation.controller.js';

@Module({
  controllers: [AffectationController],
  providers: [AffectationService],
})
export class AffectationModule {}
