import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrivilegeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}
