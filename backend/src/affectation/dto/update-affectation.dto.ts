import { PartialType } from '@nestjs/swagger';
import { CreateAffectationDto } from './create-affectation.dto.js';

export class UpdateAffectationDto extends PartialType(CreateAffectationDto) {}
