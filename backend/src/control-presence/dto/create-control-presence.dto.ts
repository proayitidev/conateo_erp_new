import { IsInt, IsNotEmpty, IsString, Min, ValidateIf } from 'class-validator';

export class CreateControlPresenceDto {
  @ValidateIf((val) => !val.employeeId)
  @IsNotEmpty()
  @IsString()
  qrCode?: string;

  @ValidateIf((val) => !val.qrCode)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  employeeId?: number;
}

export class CreateControlPresenceDtos {}
