import { IsNotEmpty, IsString } from 'class-validator';

export class ReadFileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  directory?: string;
}
