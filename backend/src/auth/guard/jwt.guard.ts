import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../utils/prisma/prisma.service.js';

import { Reflector } from '@nestjs/core';
import { JWTKey } from '../decorators/jwt.decorator.js';
import { JwtPayload } from '../interface/auth.interface.js';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const dataModule =
      this.reflector.getAllAndOverride<boolean>(JWTKey, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      if (!dataModule) return true;
      throw new UnauthorizedException(['not_authenticated']);
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: this.config.get('JWT_SECRET'),
      });

      const user = await this.prisma.users.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            select: {
              rolePrivs: {
                include: {
                  privilege: true,
                },
              },
            },
          },
        },
      });
      request['user'] = user;
    } catch {
      throw new UnauthorizedException(['not_authenticated']);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
