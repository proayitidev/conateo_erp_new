import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCftdcDto } from './dto/create-cftdc.dto.js';
import { UpdateCftdcDto } from './dto/update-cftdc.dto.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';
import { successWrapper } from '../utils/common/successwrapper.js';

@Injectable()
export class CftdcService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

}
