import { PartialType } from '@nestjs/swagger';
import { CreateCftdcDto } from './create-cftdc.dto.js';

export class UpdateCftdcDto extends PartialType(CreateCftdcDto) {}
