import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto, DocumentPriv, RolePriv } from './create-role.dto.js';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ValidateNested({ each: true })
  @Type(() => RolePriv)
  @IsOptional()
  deletedPriv?: RolePriv[];

  @ValidateNested({ each: true })
  @Type(() => DocumentPriv)
  @IsOptional()
  deletedDocumentPriv?: DocumentPriv[];

  @IsOptional()
  @IsString({ each: true })
  deletedModule?: string[];
}
