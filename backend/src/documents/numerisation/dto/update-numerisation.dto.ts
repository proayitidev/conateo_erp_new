import { PartialType } from '@nestjs/swagger';
import { CreateNumerisationDto } from './create-numerisation.dto.js';

export class UpdateNumerisationDto extends PartialType(CreateNumerisationDto) {}
