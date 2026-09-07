import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { MailModule } from '../utils/mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Must be exported for AuthModule to use it
})
export class UsersModule {}
