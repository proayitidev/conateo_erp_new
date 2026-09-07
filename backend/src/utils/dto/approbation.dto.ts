import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ApprobationDto {
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;
}
