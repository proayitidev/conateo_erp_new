import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAppModuleDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  image: string;
}
