import { Module } from '@nestjs/common';
import { HomologationService } from './homologation.service.js';
import { HomologationController } from './homologation.controller.js';
import { ApplicationModule } from './application/application.module.js';
import { RouterModule } from '@nestjs/core';

@Module({
  controllers: [HomologationController],
  providers: [HomologationService],
  imports: [RouterModule.register([
    {
      path: 'homologation',
      children: [ApplicationModule],
    },
  ]), ApplicationModule],
})
export class HomologationModule { }
