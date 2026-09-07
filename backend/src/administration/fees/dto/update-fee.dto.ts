import { PartialType } from '@nestjs/swagger';
import { CreateFeeDto } from './create-fee.dto.js';

export class UpdateFeeDto extends PartialType(CreateFeeDto) {}
