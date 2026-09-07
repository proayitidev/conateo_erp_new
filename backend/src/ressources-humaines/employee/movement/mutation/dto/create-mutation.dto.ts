import { OmitType } from '@nestjs/swagger';
import { CreatePromotionDto } from '../../promotion/dto/create-promotion.dto.js';

export class CreateMutationDto extends OmitType(CreatePromotionDto, [
  'gradeId',
]) {}
