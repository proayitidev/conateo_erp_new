import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsDate } from 'class-validator';

export class CreatePromotionDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ example: '1', required: true })
  employeeId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ example: '1', required: true })
  gradeId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ example: '1', required: true })
  affectationId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ example: '1992/10/25', required: true })
  startDate: Date;
}
