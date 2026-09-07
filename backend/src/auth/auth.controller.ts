/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { GetUser } from './decorators/getUser.decorator.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from './guard/jwt.guard.js';
import type { UUID } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign_in')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('sign_out')
  signOut(@GetUser('id') userId: number) {
    return this.authService.signOut(userId);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: UUID) {
    return this.authService.verifyEmail(token);
  }

  @Post('change-password')
  changePassword(
    @Query('token') token: UUID,
    @Body('password') newPassword: string,
  ) {
    return this.authService.changePassword(token, newPassword);
  }

  @Get('resend-verification-mail')
  resendVerificationMail(@Query('token') token: UUID) {
    return this.authService.resendVerificationMail(token);
  }
  // 2. PROFILE ENDPOINT (Protected)
  // Uses the 'jwt' strategy to validate the token from the Authorization header.
  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user is populated by the JwtStrategy's validate method (the JWT payload).
    return {
      message: 'CONATEL Profile Data Accessed Successfully.',
      user: req.user,
    };
  }
}
