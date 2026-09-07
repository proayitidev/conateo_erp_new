import { ApiProperty } from '@nestjs/swagger';
import { PersonnelRole } from '../../utils/prisma/client.js';
import { IsString, IsEnum } from 'class-validator';

export class CreateStationPersonnelDto {
  @ApiProperty()
  @IsString()
  stationId: string;

  @ApiProperty({ enum: PersonnelRole })
  @IsEnum(PersonnelRole)
  role: PersonnelRole;

  @ApiProperty()
  @IsString()
  nin: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  email: string;
}
