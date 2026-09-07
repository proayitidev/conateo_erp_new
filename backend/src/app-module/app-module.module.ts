import { Module } from '@nestjs/common';
import { AppModuleService } from './app-module.service.js';
import { AppModuleController } from './app-module.controller.js';

@Module({
  controllers: [AppModuleController],
  providers: [AppModuleService],
})
export class AppModuleModule {}
