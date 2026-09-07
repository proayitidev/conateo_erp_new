import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class SendMailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'exemple@email.com', required: true })
  to: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Invitation to club', required: true })
  subject: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Invitation to club', required: true })
  userName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Invitation to club', required: true })
  verificationLink: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Invitation to club', required: true })
  expireDate: string;
}

export class SendMailConfirmationDto extends SendMailDto {
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @ApiProperty({ example: '1234', required: true, minLength: 4, maxLength: 4 })
  password: string;
}
