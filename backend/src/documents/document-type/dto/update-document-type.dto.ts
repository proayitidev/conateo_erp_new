import { OmitType, PartialType } from '@nestjs/swagger';
import {
  CreateDocumentTypeDto,
  DocumentRoute,
} from './create-document-type.dto.js';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateDocumentTypeDto extends PartialType(
  OmitType(CreateDocumentTypeDto, ['route']),
) {
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  deletedRoute?: number[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateDocumentRoute)
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  route: UpdateDocumentRoute[] = [];
}

export class UpdateDocumentRoute extends DocumentRoute {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  id?: number;

  @ValidateIf((o) => o.id !== undefined)
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  index: number;
}
