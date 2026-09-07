import { Module } from '@nestjs/common';
import { UserLogsService } from './user-logs.service.js';
import { UserLogsController } from './user-logs.controller.js';

@Module({
  controllers: [UserLogsController],
  providers: [UserLogsService],
})
export class UserLogsModule {}
