
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { $Enums } from '../../../utils/prisma/client.js';

export class CreateGradeDto {
  @IsEnum($Enums.EmployeeType)
  @IsNotEmpty()
  employeeType: $Enums.EmployeeType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum($Enums.AffectationType)
  affectationType: $Enums.AffectationType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryGridId: number;
}
