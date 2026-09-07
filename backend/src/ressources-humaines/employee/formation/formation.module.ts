import { Module } from '@nestjs/common';
import { FormationService } from './formation.service.js';
import { FormationController } from './formation.controller.js';

@Module({
  controllers: [FormationController],
  providers: [FormationService],
  exports: [FormationService],
})
export class FormationModule {}
