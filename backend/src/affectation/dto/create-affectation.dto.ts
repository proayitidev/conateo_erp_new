import { $Enums } from '../../utils/prisma/client.js';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateAffectationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sigle: string;

  @IsEnum($Enums.AffectationType)
  @IsNotEmpty()
  type: $Enums.AffectationType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  leaderId?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  parentId?: number;

  @IsNumber(undefined, { each: true })
  @Min(1, { each: true })
  @IsOptional()
  typeDocuments: number[] = [];
}
