import { Module } from '@nestjs/common';
import { AttestationService } from './attestation.service.js';
import { AttestationController } from './attestation.controller.js';

@Module({
  controllers: [AttestationController],
  providers: [AttestationService],
})
export class AttestationModule {}
