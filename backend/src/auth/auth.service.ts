/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto.js';
import { ConfigService } from '@nestjs/config';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { successWrapper } from '../utils/common/successwrapper.js';
import { hash, verify } from 'argon2';
import type { UUID } from 'crypto';
import moment from 'moment-timezone';
import { MailService } from '../utils/mail/mail.service.js';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async signIn(dto: SignInDto) {
    try {
      const { email, password } = dto;

      const employee = await this.prisma.employee.findUnique({
        where: {
          email,
          user: {
            isNot: null,
          },
        },
        include: {
          user: {
            include: {
              role: {
                include: {
                  rolePrivs: {
                    include: {
                      privilege: {
                        select: {
                          label: true,
                        },
                      },
                    },
                  },
                  modulePrivs: {
                    include: {
                      module: {
                        select: {
                          label: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!employee || !employee.user) {
        throw new NotFoundException('user');
      }
      if (employee.user.status !== 'ACTIVE') {
        throw new UnauthorizedException(`account_${employee.user.status}`);
      }
      const { user, ...empData } = employee;
      const { password: hash_password, ...rest } = user;
      if ((await verify(hash_password, password)) == false) {
        throw new NotAcceptableException('email_password_missmatch');
      }
      const authToken = await this.generateAuthToken(user.id);
      await this.prisma.logs.create({
        data: {
          type: 'USER',
          action: 'SIGNIN',
          userId: user.id,
        },
      });
      return successWrapper(HttpStatus.OK, 'sigin_success', {
        ...rest,
        access_token: authToken,
        // balances: account.balances,
      });
    } catch (error) {
      console.log(error);
      return this.errorHandler.handleError(error);
    }
  }

  async signOut(userId: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('user not exist');
      }
      await this.prisma.logs.create({
        data: {
          type: 'USER',
          action: 'SIGNOUT',
          userId: userId,
        },
      });
      return successWrapper(HttpStatus.OK, 'Signout successfully', null);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  private async generateAuthToken(id: number) {
    const payload = {
      sub: id,
    };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async verifyEmail(token: UUID) {
    try {
      console.log('the token', token);
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      const authen = await this.prisma.authentification.findUnique({
        where: {
          id: token,
        },
      });
      console.log('the authen', authen);
      if (!authen) {
        throw new NotFoundException('invalid_verification_link');
      }

      if (moment(authen.expiresAt).isBefore(moment())) {
        throw new NotAcceptableException('vefification_link_expired');
      }

      return successWrapper(HttpStatus.OK, 'auth_valid', null);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
  async resendVerificationMail(token: UUID) {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      const authen = await this.prisma.authentification.findUnique({
        where: {
          id: token,
        },
        include: {
          user: {
            include: {
              employee: true,
            },
          },
        },
      });
      if (!authen) {
        throw new NotFoundException('invalid_verification_link');
      }
      const { email, firstName, lastName } = authen.user.employee;
      await this.mailService.sendSignupOtp(
        `${email}`,
        `${firstName} ${lastName.toUpperCase()}`,
        authen.id as UUID,
        '10 Minutes',
      );
      await this.prisma.authentification.update({
        where: {
          id: authen.id,
        },
        data: {
          expiresAt: moment().add(10, 'minute').toDate(),
        },
      });
      return successWrapper(
        HttpStatus.OK,
        'verification_mail_sent_success',
        null,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async changePassword(token: UUID, newPassword: string) {
    try {
      const authen = await this.prisma.authentification.findUnique({
        where: {
          id: token,
        },
      });
      if (!authen) {
        throw new NotFoundException('invalid_verification_link');
      }
      if (moment(authen.expiresAt).isBefore(moment())) {
        throw new NotAcceptableException('vefification_link_expired');
      }
      await this.prisma.users.update({
        where: {
          id: authen.userId,
        },
        data: {
          status: 'ACTIVE',
          password: await hash(newPassword),
        },
      });
      await this.prisma.authentification.delete({
        where: {
          id: authen.id,
        },
      });
      return successWrapper(HttpStatus.OK, 'email_verified_succesfuly', null);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
