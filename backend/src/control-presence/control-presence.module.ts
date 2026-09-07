import { Module } from '@nestjs/common';
import { ControlPresenceService } from './control-presence.service.js';
import { ControlPresenceController } from './control-presence.controller.js';

@Module({
  controllers: [ControlPresenceController],
  providers: [ControlPresenceService],
})
export class ControlPresenceModule {}
