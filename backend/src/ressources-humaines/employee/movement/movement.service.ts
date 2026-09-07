import { Inject, Injectable } from '@nestjs/common';
import { ErrorHandlerService } from '../../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../../utils/prisma/prisma.service.js';
import type { IFileStorage } from '../../../utils/file-manager/interface/file-manager.interface.js';

@Injectable()
export class MovementService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) {}
}
