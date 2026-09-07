import { OmitType, PartialType } from '@nestjs/swagger';
import {
  CreateLeavePolicyDto,
  LeaveTierDto,
} from './create-leave-policy.dto.js';

export class UpdateLeavePolicyDto extends PartialType(
  OmitType(CreateLeavePolicyDto, ['leaveTiers']),
) { }
export class UpdateLeaveTierDto extends PartialType(LeaveTierDto) { }
