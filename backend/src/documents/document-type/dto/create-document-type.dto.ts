import { $Enums } from '../../../utils/prisma/client.js';
import { plainToClass, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateDocumentTypeDto {
  @IsEnum($Enums.typeDocumentType)
  @IsNotEmpty()
  type: $Enums.typeDocumentType;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  template?: string;

  @IsOptional()
  @Transform(
    ({ value }) => {
      console.log('type of root', typeof value);
      const transform =
        typeof value === 'string'
          ? plainToClass(DocumentRoute, JSON.parse(value))
          : value;
      return transform;
    },
    { toClassOnly: true },
  )
  @ValidateNested({ each: true })
  @Type(() => DocumentRoute)
  route: DocumentRoute[];
}

export class DocumentRoute {
  @IsEnum($Enums.ApprovalType)
  @IsNotEmpty()
  type: $Enums.ApprovalType;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  affectationId: number;
}
