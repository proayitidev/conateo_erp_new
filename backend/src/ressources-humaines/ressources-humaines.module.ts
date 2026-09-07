import { Module } from '@nestjs/common';
import { RessourcesHumainesService } from './ressources-humaines.service.js';
import { RessourcesHumainesController } from './ressources-humaines.controller.js';
import { RouterModule } from '@nestjs/core';

import { EmployeeModule } from './employee/employee.module.js';
import { MovementModule } from './employee/movement/movement.module.js';
import { AttestationModule } from './employee/attestation/attestation.module.js';
import { FormationModule } from './employee/formation/formation.module.js';
import { LeavesModule } from './employee/leaves/leaves.module.js';
import { DotationModule } from './employee/movement/dotation/dotation.module.js';
import { PromotionModule } from './employee/movement/promotion/promotion.module.js';
import { MutationModule } from './employee/movement/mutation/mutation.module.js';

@Module({
  controllers: [RessourcesHumainesController],
  providers: [RessourcesHumainesService],
  imports: [
    EmployeeModule,
    RouterModule.register([
      {
        path: 'rh',
        module: RessourcesHumainesModule,
        children: [
          {
            path: 'employees',
            module: EmployeeModule,
            children: [
              {
                path: 'attestations',
                module: AttestationModule,
              },
              {
                path: 'leaves',
                module: LeavesModule,
              },
              {
                path: 'formations',
                module: FormationModule,
              },
              {
                path: 'movements',
                module: MovementModule,
                children: [
                  {
                    path: 'dotations',
                    module: DotationModule,
                  },
                  {
                    path: 'promotions',
                    module: PromotionModule,
                  },
                  {
                    path: 'mutations',
                    module: MutationModule,
                  },
                ],
              },
            ],
          },
        ],
      },
    ]),
  ],
})
export class RessourcesHumainesModule {}
