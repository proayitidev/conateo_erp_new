import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto.js';
enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

class EmployeeOrderBy {
  @IsOptional()
  @IsEnum(SortOrder)
  id?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  firstName?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  lastName?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  affectation?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  dob?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  createdAt?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  updatedAt?: SortOrder;
}

export class FilterEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @Type(() => EmployeeOrderBy)
  orderBy?: EmployeeOrderBy;
}
