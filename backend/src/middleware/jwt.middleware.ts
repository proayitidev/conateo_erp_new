import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StaticAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]; // or req.cookies.jwt
    try {
      if (!token) throw new Error();
      this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: this.config.get('JWT_SECRET'),
      });
      // Basic JWT check
      // Add custom validation logic here (e.g., check file permissions)
      next();
    } catch (e) {
      console.log('the error', e);
      throw new UnauthorizedException(['not_authenticated']);
    }
  }
}
