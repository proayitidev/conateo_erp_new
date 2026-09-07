import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsNotEmpty, IsDate } from 'class-validator';

export class StatusDto {
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

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '1992/10/25', required: false })
  endDate?: Date;
}
