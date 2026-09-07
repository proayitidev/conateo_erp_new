import { PartialType } from '@nestjs/swagger';
import { CreateLeaveDto, CreateLeaveRequestDto } from './create-leave.dto.js';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) { }
export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) { }
