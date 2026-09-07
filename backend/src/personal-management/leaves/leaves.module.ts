import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service.js';
import { LeavesController } from './leaves.controller.js';
import { HolidaysService } from '../../administration/holidays/holidays.service.js';

@Module({
  controllers: [LeavesController],
  providers: [LeavesService, HolidaysService],
})
export class LeavesModule { }
