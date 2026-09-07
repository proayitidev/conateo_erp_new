import { Module } from '@nestjs/common';
import { DeemService } from './deem.service.js';
import { DeemController } from './deem.controller.js';
import { FacturationModule } from './facturation/facturation.module.js';
import { OperatorModule } from './operator/operator.module.js';
import { RouterModule } from '@nestjs/core';

@Module({
  controllers: [DeemController],
  providers: [DeemService],
  imports: [
    RouterModule.register([
      {
        path: 'deem',
        children: [FacturationModule, OperatorModule],
      },
    ]),
    FacturationModule,
    OperatorModule,
  ],
})
export class DeemModule {}
