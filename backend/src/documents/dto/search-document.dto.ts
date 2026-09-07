import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

class DocumentOrderBy {
  @IsOptional()
  @IsEnum(SortOrder)
  type?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  code?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  date?: SortOrder;

  @IsOptional()
  @IsEnum(SortOrder)
  created_at?: SortOrder;
}

export class SearchDocumentDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  typeId?: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '1992-10-25', required: false })
  date?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @Type(() => DocumentOrderBy)
  orderBy?: DocumentOrderBy;
}
