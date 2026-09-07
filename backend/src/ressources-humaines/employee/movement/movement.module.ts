import { Module } from '@nestjs/common';
import { MovementService } from './movement.service.js';
import { MovementController } from './movement.controller.js';
import { DotationModule } from './dotation/dotation.module.js';
import { PromotionModule } from './promotion/promotion.module.js';
import { MutationModule } from './mutation/mutation.module.js';
@Module({
  controllers: [MovementController],
  providers: [MovementService],
  imports: [DotationModule, PromotionModule, MutationModule],
})
export class MovementModule {}
