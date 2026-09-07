import { Module } from '@nestjs/common';
import { PrivilegesService } from './privileges.service.js';
import { PrivilegesController } from './privileges.controller.js';

@Module({
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
})
export class PrivilegesModule {}
