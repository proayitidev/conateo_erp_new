import { Module } from '@nestjs/common';
import { MutationService } from './mutation.service.js';
import { MutationController } from './mutation.controller.js';

@Module({
  controllers: [MutationController],
  providers: [MutationService],
})
export class MutationModule {}
