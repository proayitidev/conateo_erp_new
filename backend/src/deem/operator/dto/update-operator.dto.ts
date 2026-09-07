import { PartialType } from '@nestjs/swagger';
import { CreateOperatorDto } from './create-operator.dto.js';

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {}
