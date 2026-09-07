import { ApiProperty } from '@nestjs/swagger';
import { CertificateType, RadioApplicationStatus } from '../../utils/prisma/client.js';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateRadioApplicationDto {
  @ApiProperty()
  @IsString()
  stationId: string;

  @ApiProperty({ enum: CertificateType })
  @IsEnum(CertificateType)
  requestType: CertificateType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RadioApplicationStatus, required: false })
  @IsOptional()
  @IsEnum(RadioApplicationStatus)
  paymentStatus?: RadioApplicationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signatureName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  signatureDate?: Date;
}
