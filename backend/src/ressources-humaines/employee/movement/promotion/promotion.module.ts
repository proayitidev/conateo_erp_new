import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service.js';
import { PromotionController } from './promotion.controller.js';

@Module({
  controllers: [PromotionController],
  providers: [PromotionService],
})
export class PromotionModule {}
