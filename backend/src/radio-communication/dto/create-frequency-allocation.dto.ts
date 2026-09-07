import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateFrequencyAllocationDto {
  @ApiProperty()
  @IsString()
  frequencyBandId: string;

  @ApiProperty()
  @IsNumber()
  startFreq: number;

  @ApiProperty()
  @IsNumber()
  endFreq: number;

  @ApiProperty()
  @IsNumber()
  power: number;

  @ApiProperty({ required: false })
  @IsString()
  unit?: string;
}
