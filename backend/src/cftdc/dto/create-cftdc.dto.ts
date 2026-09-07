import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { $Enums } from '../../utils/prisma/client.js';

export class CreateCftdcDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  theme: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  place: string;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  employees: number[];

  @ValidateNested({ each: true })
  @Type(() => OrganizerDto)
  @IsArray()
  @IsNotEmpty()
  organizers: OrganizerDto[];
}

export class OrganizerDto {
  @IsEnum($Enums.OrganizerType)
  @IsNotEmpty()
  type: $Enums.OrganizerType;

  @IsInt()
  @IsNotEmpty()
  employeeId: number;
}
