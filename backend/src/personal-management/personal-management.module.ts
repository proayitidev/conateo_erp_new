import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PersonalManagementController } from './personal-management.controller.js';
import { PersonalManagementService } from './personal-management.service.js';
import { ControlPresenceService } from '../control-presence/control-presence.service.js';
import { LeavesModule } from './leaves/leaves.module.js';
import { AttestationModule } from './attestation/attestation.module.js';

@Module({
  controllers: [PersonalManagementController],
  providers: [PersonalManagementService, ControlPresenceService],
  imports: [
    LeavesModule,
    AttestationModule,
    RouterModule.register([
      {
        path: 'personal-management',
        module: PersonalManagementModule,
        children: [
          {
            path: 'leaves',
            module: LeavesModule,
          },
          {
            path: 'attestation',
            module: AttestationModule,
          },
        ],
      },
    ]),
  ],
})
export class PersonalManagementModule {}
