import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSalaryGridDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  gradeId: number;

  @IsNumber()
  @IsNotEmpty()
  minSalary: number;

  @IsNumber()
  @IsNotEmpty()
  maxSalary: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  levelData: number = 1;

  @IsNumber()
  @IsNotEmpty()
  fiscalYear: number;
}
