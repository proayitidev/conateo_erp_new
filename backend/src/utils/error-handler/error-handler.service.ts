import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../prisma/client.js';
// import { BadRequestError } from '@stellar/stellar-sdk';

@Injectable()
export class ErrorHandlerService {
  handleError(error: any) {
    console.log("the error type: ", typeof error, error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      Logger.error(error.meta);
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(['Record already exists']);
        case 'P2025':
          throw new NotFoundException(['Record not found']);
        default:
          throw new BadRequestException([error?.message || 'Bad Request']);
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException([
        error?.[Symbol.toStringTag] || 'Bad Request',
      ]);
    } else if (error instanceof HttpException) {
      throw new HttpException(error.getResponse(), error.getStatus());
    }
    // console.log("the error type", error instanceof BadRequestError)

    throw new InternalServerErrorException(['Something went wrong']);
  }
}
