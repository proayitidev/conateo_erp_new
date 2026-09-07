import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class SignInDto {
  @ValidateIf((v) => !v.userName)
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
