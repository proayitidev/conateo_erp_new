
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { $Enums } from '../../../utils/prisma/client.js';

export class CreateLeavePolicyDto {
  @IsEnum($Enums.LeavePolicyType)
  @IsNotEmpty()
  type: $Enums.LeavePolicyType;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  typeDocumentId?: number;

  @ValidateNested({ each: true })
  @Type(() => LeaveTierDto)
  @IsOptional()
  leaveTiers: LeaveTierDto[] = [];
}

export class LeaveTierDto {
  @IsInt()
  @IsNotEmpty()
  minYearsService: number;

  @IsInt()
  @IsNotEmpty()
  daysAvailable: number;
}
