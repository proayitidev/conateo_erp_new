import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @Type(() => Number)
  skip?: number;
}
