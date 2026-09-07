import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import type { UUID } from 'crypto';
import { SendMailConfirmationDto } from './dto/mail.dto.js';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}
  async sendUserConfirmation(dto: SendMailConfirmationDto) {
    const { to, subject, userName, verificationLink, expireDate } = dto;
    await this.mailerService.sendMail({
      to: to,
      subject: subject,
      template: './authentification', // `.hbs` extension is automatically appended
      context: {
        emailSubject: subject,
        companyLogo: this.config.get('COMP_LOGO_IMAGE'), // Replace with your actual logo URL
        userName,
        verificationLink,
        expireDate,
      },
    });
  }
  sendSignupOtp(to: string, userName: string, token: UUID, expireDate: string) {
    return this.sendUserConfirmation({
      to,
      userName,
      verificationLink: `${this.config.get('VERCEL_PROJECT_PRODUCTION_URL') || 'http://localhost:3000'}/verify-email?token=${token}`,
      expireDate,
      subject: 'Activation de votre compte CONATEL',
    } as SendMailConfirmationDto);
  }

  sendForgotPwdOtp(
    to: string,
    userName: string,
    verificationLink: string,
    expireDate: string,
  ) {
    return this.sendUserConfirmation({
      to,
      userName,
      verificationLink,
      expireDate,
      subject: 'OTP Pou Modpas Bliye',
    } as SendMailConfirmationDto);
  }
}
