import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '../../../../../utils/prisma/client.js';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  ValidateIf,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  IsDate,
  IsInt,
  IsOptional,
} from 'class-validator';
import { CreateEmployeeDto } from '../../../../../ressources-humaines/employee/dto/create-employee.dto.js';

export class DARHDto {
  @ValidateIf((value) => value.type == $Enums.MovementType.DOTATION)
  @IsEnum($Enums.DotationType)
  @IsNotEmpty()
  type!: $Enums.DotationType;

  @IsNotEmpty()
  @IsOptional()
  @IsInt()
  @ApiProperty({ example: '1', required: true })
  gradeId: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ example: '1', required: true })
  fonctionId: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: '1', required: true })
  affectationId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ example: '1992/10/25', required: true })
  startDate: Date;

  @ValidateIf((value) => value.type != $Enums.DotationType.NOMINATION)
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ example: '1992/10/25', required: false })
  endDate!: Date;
}
export class CreateDotationDto {
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      const parsed = (
        typeof value === 'string' ? JSON.parse(value) : value
      ) as Record<string, any>;
      return plainToInstance(CreateEmployeeDto, parsed);
    },
    { toClassOnly: true },
  )
  @ValidateNested()
  @Type(() => CreateEmployeeDto)
  @IsNotEmpty()
  employee!: CreateEmployeeDto;

  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      const parsed = (
        typeof value === 'string' ? JSON.parse(value) : value
      ) as Record<string, any>;
      return plainToInstance(DARHDto, parsed);
    },

    { toClassOnly: true },
  )
  @ValidateNested()
  @Type(() => DARHDto)
  @IsNotEmpty()
  darh!: DARHDto;
}
