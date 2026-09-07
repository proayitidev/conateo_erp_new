import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../utils/mail/mail.module.js';
import 'dotenv/config';
import { env } from 'prisma/config';
@Module({
  imports: [
    MailModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: env('JWT_SECRET'),
      signOptions: { expiresIn: '920m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
