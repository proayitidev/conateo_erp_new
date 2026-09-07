import { PartialType } from '@nestjs/swagger';
import { CreateFacturationDto } from './create-facturation.dto.js';

export class UpdateFacturationDto extends PartialType(CreateFacturationDto) {}
