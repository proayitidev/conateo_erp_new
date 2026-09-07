import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateNumerisationDto } from './dto/create-numerisation.dto.js';
import { UpdateNumerisationDto } from './dto/update-numerisation.dto.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { successWrapper } from '../../utils/common/successwrapper.js'

import { basename, extname } from 'path';
import type { IFileStorage } from '../../utils/file-manager/interface/file-manager.interface.js';
import moment from 'moment-timezone';
import { get } from 'lodash-es';

@Injectable()
export class NumerisationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) {}

  createDocumentCode(organisationId: number, typeId: number) {
    const day = moment().format('DDMMYY-HHmmss');
    return `CNT-${organisationId.toString().padStart(2, '0')}-${typeId.toString().padStart(2, '0')}-${day}`;
  }
  async create(
    userId: number,
    documentAccess: string[],
    createNumerisationDto: CreateNumerisationDto,
    file: Express.Multer.File,
  ) {
    try {
      const { typeId, typeCode, date, description } = createNumerisationDto;
      const typeDocument = await this.prisma.typeDocuments.findUnique({
        where: {
          id: typeId,
          code: typeCode,
        },
        include: {
          route: {
            where: {
              type: 'create',
              index: 1,
            },
            take: 1,
          },
        },
      });
      if (!typeDocument) {
        throw new NotFoundException('document_type_not_found');
      }

      if (!documentAccess.includes(typeDocument.code)) {
        throw new ForbiddenException('document_type_access_forbidden');
      }
      const name = this.createDocumentCode(
        typeDocument.route[0].affectationId,
        typeId,
      );
      const data = await this.prisma.$transaction(async (tx) => {
        const uploadedFile = await this.fileManager.updateFileToRoot({
          buffer: file.buffer,
          directory: 'numerisation',
          fileName: `${name}.${this.fileManager.getExtention(file.originalname)}`,
        });
        const documentCreation = await tx.documents.create({
          data: {
            typeId,
            code: name,
            date,
            description,
            createdById: userId,
            path: basename(uploadedFile),
            documentApprovals: {
              create: {
                type: 'create',
                userId: userId,
              },
            },
          },
          include: {
            type: true,
          },
        });
        return documentCreation;
      });
      if (!data) {
        throw new UnprocessableEntityException('somthing_went_worng');
      }

      await this.prisma.logs.create({
        data: {
          type: 'NUMERISATION',
          action: 'CREATE',
          userId: userId,
          logInfo: {
            documentTypeId: typeId,
            reference: data.code,
            date: date,
            description: description,
            type: data.type.code,
          },
        },
      });

      // await this.createNotification(data.id);

      return successWrapper(HttpStatus.CREATED, 'success_scan', {
        id: data.id,
        code: data.code,
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  findAll() {
    return `This action returns all numerisation`;
  }

  async findOne(id: number) {
    try {
      const document = await this.prisma.documents.findUnique({
        where: {
          id,
        },
        include: {
          type: {
            select: {
              code: true,
              label: true,
            },
          },
        },
      });

      // throw new NotFoundException('not found');
      return successWrapper(HttpStatus.OK, '', document);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  update(id: number, updateNumerisationDto: UpdateNumerisationDto) {
    return `This action updates a #${id} numerisation`;
  }

  async remove(userId: number, id: number) {
    try {
      const deleted = await this.prisma.documents.delete({
        where: { id },
      });
      await this.prisma.logs.create({
        data: {
          type: 'NUMERISATION',
          action: 'DELETE',
          userId: userId,
          logInfo: {
            documentTypeId: deleted.typeId,
            reference: deleted.code,
            date: deleted.date,
            description: deleted.description,
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'scan_removed', deleted);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async signDocument(userId: number, docId: number, file: Express.Multer.File) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
        include: {
          employee: {
            include: {
              status: true,
            },
          },
        },
      });
      const document = await this.prisma.documents.findUnique({
        where: {
          id: docId,
        },
        include: {
          type: {
            include: {
              route: {
                orderBy: {
                  index: 'asc',
                },
              },
            },
          },
        },
      });
      if (!document) {
        throw new NotFoundException('scan_not_found');
      }

      const { route } = document.type;
      const myRoute = route.findIndex(
        (val) =>
          val.affectationId === get(user, 'employee.status.affectationId'),
      );
      if (myRoute == -1) {
        throw new UnauthorizedException('document_access_forbidden');
      } else if (route[myRoute].type != 'signature') {
        throw new UnauthorizedException('no_sign_right');
      }

      const data = await this.prisma.$transaction(async (tx) => {
        const uploadedFile = await this.fileManager.updateFileToRoot({
          buffer: file.buffer,
          directory: 'numerisation',
          fileName: `${document.code}_signed.${extname(file.originalname)}`,
        });
        const documentCreation = await tx.documents.update({
          where: {
            id: docId,
          },
          data: {
            status: 'signed',
            path: uploadedFile,
            documentApprovals: {
              create: {
                type: 'signature',
                userId: userId,
              },
            },
          },
        });
        return documentCreation;
      });
      if (data) {
        await this.prisma.logs.create({
          data: {
            type: 'NUMERISATION',
            action: 'SIGNED',
            userId: userId,
            logInfo: {
              documentTypeId: document.type,
              reference: document.code,
              date: document.date,
              description: document.description,
              type: document.type.code,
            },
          },
        });
        await this.prisma.notification.create({
          data: {
            type: 'ALERT',
            userId: document.createdById,
            info: {
              type: 'document',
              action: 'signed',
              documentId: document.id,
              documentCode: document.code,
              documentTypeId: document.typeId,
              documentTypeName: document.type.code,
            },
          },
        });
        // await this.createNotification(data.id);

        return successWrapper(HttpStatus.CREATED, 'scan_document_signed', true);
      }
      return successWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'can_not_process_request_right_now',
        null,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
