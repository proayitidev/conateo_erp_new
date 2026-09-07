import { Module } from '@nestjs/common';
import { GradeService } from './grade.service.js';
import { GradeController } from './grade.controller.js';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
