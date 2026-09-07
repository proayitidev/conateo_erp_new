import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateRadioStationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  stationCode: string;

  @ApiProperty()
  @IsString()
  nif: string;

  @ApiProperty()
  @IsString()
  patente: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  commune: string;

  @ApiProperty()
  @IsString()
  department: string;

  @ApiProperty()
  @IsString()
  coverageZone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsString()
  contactName: string;

  @ApiProperty()
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
