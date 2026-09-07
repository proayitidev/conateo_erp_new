import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOperatorCallPriceDto {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  on_net: number;

  @IsNumber()
  @IsNotEmpty()
  off_net: number;

  @IsNumber()
  @IsNotEmpty()
  international: number;
}
