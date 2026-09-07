import { Module } from '@nestjs/common';
import { RadioCommunicationService } from './radio-communication.service.js';
import { RadioCommunicationController } from './radio-communication.controller.js';

@Module({
  controllers: [RadioCommunicationController],
  providers: [RadioCommunicationService],
  exports: [RadioCommunicationService],
})
export class RadioCommunicationModule {}
