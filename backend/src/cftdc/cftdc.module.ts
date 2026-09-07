import { Module } from '@nestjs/common';
import { CftdcService } from './cftdc.service.js';
import { CftdcController } from './cftdc.controller.js';
import { FormationsModule } from './formations/formations.module.js';
import { RouterModule } from '@nestjs/core';

@Module({
  controllers: [CftdcController],
  providers: [CftdcService],
  imports: [
    RouterModule.register([
      {
        path: 'cftdc',
        children: [FormationsModule],
      },
    ]),
    FormationsModule],
})
export class CftdcModule { }
