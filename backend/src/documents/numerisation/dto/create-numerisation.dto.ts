import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateNumerisationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  typeId: number;

  @ValidateIf((o) => !o.typeId)
  @IsString()
  @IsNotEmpty()
  typeCode?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  description?: string;
}
