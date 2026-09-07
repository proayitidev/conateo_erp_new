import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateFormationDto } from './dto/create-formation.dto.js';
import { UpdateFormationDto } from './dto/update-formation.dto.js';
import { ErrorHandlerService } from '../../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../../utils/prisma/prisma.service.js';
import { successWrapper } from '../../../utils/common/successwrapper.js'
import { Prisma } from '../../../utils/prisma/client.js';
import type { IFileStorage } from '../../../utils/file-manager/interface/file-manager.interface.js';
import path from 'path';

@Injectable()
export class FormationService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) {}
  async create(
    employeeId: number,
    dto: CreateFormationDto,
    tx?: Prisma.TransactionClient,
  ) {
    try {
      const transactionRequest = tx ?? this.prisma;

      const { documentName, ...rest } = dto;
      const uploadFile = await this.uploadDocuments(
        rest.name + rest.type,
        documentName,
      );

      const createFormation = await transactionRequest.formation.create({
        data: {
          ...rest,
          employee: {
            connect: {
              id: employeeId,
            },
          },
          documentName: uploadFile,
        },
      });
      return successWrapper(
        HttpStatus.CREATED,
        'formation_created',
        createFormation,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async uploadDocuments(
    newName: string,
    name?: string,
    oldName?: string | null,
  ) {
    if (!name) return undefined;

    const uploadedFile = await this.fileManager.moveFileToRoot({
      from: {
        directory: 'temp_files',
        fileName: name,
      },
      to: {
        directory: 'formations',
        fileName: newName + path.extname(name),
      },
      delete: oldName
        ? { fileName: oldName, directory: 'formations' }
        : undefined,
      returnType: 'NAME',
    });
    return uploadedFile;
  }

  async findAll(employeeId: number) {
    try {
      const formations = await this.prisma.formation.findMany({
        where: {
          employeeId,
        },
      });
      return successWrapper(HttpStatus.OK, '', formations);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} formation`;
  }

  async update(
    id: number,
    dto: UpdateFormationDto,
    tx?: Prisma.TransactionClient,
  ) {
    try {
      const transactionRequest = tx ?? this.prisma;
console.log("the id is", id)
      const { documentName, ...rest } = dto;
      const oldFormation = await transactionRequest.formation.findUniqueOrThrow(
        {
          where: { id },
        },
      );
      let newDocumentName = documentName;
      if (documentName != oldFormation.documentName) {
        newDocumentName = await this.uploadDocuments(
          oldFormation.name + oldFormation.type,
          documentName,
          oldFormation.documentName,
        );
      }
      const updateFormation = await transactionRequest.formation.update({
        where: { id },
        data: {
          ...rest,
          documentName: newDocumentName,
        },
      });

      return successWrapper(
        HttpStatus.CREATED,
        'formation_created',
        updateFormation,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} formation`;
  }
}
