import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  roleId: string;
}
