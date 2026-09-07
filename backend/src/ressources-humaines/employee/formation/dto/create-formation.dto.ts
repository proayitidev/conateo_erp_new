import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  Min,
  IsInt,
  IsString,
  IsNotEmpty,
  ValidateIf,
  IsDate,
} from 'class-validator';

export class CreateFormationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Genie Electronique' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Faculte des sciences appliqués(FDSA)' })
  etablissement: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ example: '1992/10/25', required: true })
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ example: '1992/10/25', required: false })
  endDate?: Date;

  @ValidateIf((val) => !val.endDate)
  @IsInt()
  @IsNotEmpty()
  totalHours?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'DIPLOME' })
  type: string;

  @IsOptional()
  @IsString()
  documentName?: string;
}
