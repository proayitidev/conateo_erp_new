import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';
import { IsString, IsOptional, IsNotEmpty, ValidateIf } from 'class-validator';

export class UpdateProfilDto extends PartialType(
  OmitType(CreateUserDto, ['roleId']),
) {
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @ValidateIf(({ oldPassword }) => {
    return oldPassword ? true : false;
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
