import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '../../../utils/prisma/client.js';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsEmail,
  IsDate,
  IsOptional,
  Min,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEnum($Enums.Sexe)
  @IsNotEmpty()
  sexe!: $Enums.Sexe;

  @IsString()
  @IsNotEmpty()
  ninu!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  nif!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dob?: Date;

  @IsEnum($Enums.BloodGroup)
  @IsNotEmpty()
  bloodGroup!: $Enums.BloodGroup;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Ensures each element in the array is validated
  @Type(() => FormationDTO)
  @ApiProperty({ isArray: true })
  formations?: FormationDTO[];
}

export class FormationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Genie Electronique' })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Faculte des sciences appliqués(FDSA)' })
  etablissement!: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ example: '1992/10/25', required: true })
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ example: '1992/10/25', required: true })
  endDate?: Date;

  @ValidateIf((val: Record<string, any>) => !val.endDate)
  @IsInt()
  @IsNotEmpty()
  totalHours?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'DIPLOME' })
  type!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  documentId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
