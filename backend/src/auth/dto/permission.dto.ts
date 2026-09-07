import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { $Enums } from '../../utils/prisma/client.js';

export class PermissionDecoratorValidatorDTO {
  @ValidateNested()
  @Type(() => PrivilegeDecoratorDTO)
  privilege?: PrivilegeDecoratorDTO;

  @ValidateNested({ each: true })
  @Type(() => PrivilegeDecoratorDTO)
  or?: PrivilegeDecoratorDTO[];

  @ValidateNested({ each: true })
  @Type(() => PrivilegeDecoratorDTO)
  and?: PrivilegeDecoratorDTO[];
}

export class PrivilegeDecoratorDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: [], required: true })
  readonly code: string;

  @IsEnum($Enums.AccessLevel, { message: 'Invalid privilege' })
  @IsNotEmpty()
  @ApiProperty({ example: 'register', required: true })
  readonly permissions: $Enums.AccessLevel[];
}
