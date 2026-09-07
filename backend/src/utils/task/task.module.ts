import { Global, Module } from '@nestjs/common';
import { TaskService } from './task.service.js';

@Global()
@Module({
  providers: [TaskService],
})
export class TaskModule {}
