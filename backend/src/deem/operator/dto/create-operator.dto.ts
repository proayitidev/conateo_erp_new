import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateOperatorCallPriceDto } from './create-operator-call-price.dto.js';
import { Type } from 'class-transformer';
class OperatorCallPriceDto extends CreateOperatorCallPriceDto {}

export class CreateOperatorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => OperatorCallPriceDto)
  @IsNotEmpty()
  callPrice: OperatorCallPriceDto;
}
