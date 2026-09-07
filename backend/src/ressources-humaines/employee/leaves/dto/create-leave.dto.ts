import { OmitType } from '@nestjs/swagger';

import { $Enums } from '../../../../utils/prisma/client.js';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateLeaveDto {
  @IsInt()
  @IsNotEmpty()
  employeeId: number;

  @IsEnum($Enums.LeavePolicyType)
  @IsNotEmpty()
  type: $Enums.LeavePolicyType;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsOptional()
  reason?: string;
}


export class CreateLeaveRequestDto extends OmitType(CreateLeaveDto, [
  'employeeId',
]) { }


