
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { $Enums } from '../../../utils/prisma/client.js';
export class RolePriv {
  @IsString()
  @IsNotEmpty()
  privilegeId: string;

  @IsEnum($Enums.AccessLevel)
  @IsNotEmpty()
  accessLevel: $Enums.AccessLevel;
}

export class DocumentPriv {
  @IsNumber()
  @IsNotEmpty()
  typeDocumentId: number;

  @IsEnum($Enums.AccessLevel)
  @IsNotEmpty()
  accessLevel: $Enums.AccessLevel;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => RolePriv)
  rolePrivs: RolePriv[];

  @IsString({ each: true })
  modulePrivs: string[];

  @ValidateNested({ each: true })
  @Type(() => DocumentPriv)
  documentPrivs: DocumentPriv[];
}
