import { Module } from '@nestjs/common';
import { NumerisationService } from './numerisation.service.js';
import { NumerisationController } from './numerisation.controller.js';

@Module({
  controllers: [NumerisationController],
  providers: [NumerisationService],
})
export class NumerisationModule {}
