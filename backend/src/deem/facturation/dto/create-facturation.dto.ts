import { $Enums } from '../../../utils/prisma/client.js';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateFacturationDto {
  @IsEnum($Enums.CallType)
  @IsNotEmpty()
  callType: $Enums.CallType;

  @IsString()
  @IsNotEmpty()
  operatorName: string;

  @IsString()
  @IsNotEmpty()
  callerNumber: string;

  @IsString()
  @IsNotEmpty()
  calledNumber: string;

  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  startBalance: number;

  @IsNumber()
  @IsNotEmpty()
  endBalance: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;
}
