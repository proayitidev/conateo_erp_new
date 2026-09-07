import {
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateDotationDto } from './dto/create-dotation.dto.js';
import { UpdateDotationDto } from './dto/update-dotation.dto.js';
import path, { basename } from 'path';
import { successWrapper } from '../../../../utils/common/successwrapper.js'
import { ErrorHandlerService } from '../../../../utils/error-handler/error-handler.service.js';
import type { IFileStorage } from '../../../../utils/file-manager/interface/file-manager.interface.js';
import { PrismaService } from '../../../../utils/prisma/prisma.service.js';
import { get, isNil, omit } from 'lodash-es';

import { MomevementStatusDTO } from '../dto/movement-status.dto.js';
import moment from 'moment-timezone';
import { DocumentGeneratorService } from '../../../../utils/document-generator/document-generator.service.js';
import { DatabaseFilterDto } from '../../../../utils/dto/database-filter.dto.js';
import { EmployeeService } from '../../employee.service.js';

@Injectable()
export class DotationService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
    private readonly documentGenerator: DocumentGeneratorService,
  ) {}

  async create(
    userId: number,
    dto: CreateDotationDto,
    avatar?: Express.Multer.File,
  ) {
    try {
      const { employee, darh } = dto;

      const movement = await this.prisma.$transaction(async (tx) => {
        const grade = await tx.grade.findUnique({
          where: {
            id: darh.gradeId,
            salaryGrid: { isNot: null },
          },
          include: {
            salaryGrid: true,
          },
        });
        if (!grade) throw new UnprocessableEntityException('grade_not_found');

        await this.employeeService.createUpdateEmployee(employee);
        const movmentCreate = await tx.movementPersonel.create({
          data: {
            type: 'DOTATION',
            dotationType: darh.type,
            employee: {
              connect: {
                nif: employee.nif,
              },
            },
            startDate: darh.startDate,
            endDate: darh.endDate,
            status: {
              create: {
                startDate: darh.startDate,
                endDate: darh.endDate,
                gradeId: darh.gradeId,
                affectationId: darh.affectationId,
                initialSalary: grade.salaryGrid!.minSalary,
              },
            },
          },
        });

        if (avatar) {
          const avatarName =
            'avatar_' +
            Date.now() +
            '_' +
            movement.employeeId +
            path.extname(avatar.originalname);
          const uploadedFile = await this.fileManager.updateFileToRoot({
            buffer: avatar.buffer,
            directory: 'avatar',
            fileName: avatarName,
          });
          if (uploadedFile) {
            await tx.employee.update({
              where: {
                id: movement.employeeId,
              },
              data: {
                avatar: basename(avatarName),
              },
            });
          }
        }
        return movmentCreate;
      });

      return successWrapper(HttpStatus.CREATED, '', movement);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      const movements = await this.prisma
        .pagination()
        .movementPersonel.findManyAndCount({
          where: {
            ...where,
            type: 'DOTATION',
          },
          orderBy: orderBy,
          take: filter?.take,
          skip: filter?.skip,
          include: {
            status: {
              include: { affectation: true, grade: true },
            },
            documents: true,
            employee: {
              include: { formations: true },
            },
          },
        });
      return successWrapper(
        HttpStatus.OK,
        '',
        movements.data,
        movements.total,
        movements.totalFiltered,
      );
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const dotation = await this.prisma.movementPersonel.findUnique({
        where: { id },
      });
      return successWrapper(HttpStatus.OK, '', dotation);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateDotationDto,
    avatar?: Express.Multer.File,
  ) {
    try {
      const { employee, darh } = dto;
      const oldMovement = await this.prisma.movementPersonel.findUniqueOrThrow({
        where: { id, type: 'DOTATION' },
      });
      const movement = await this.prisma.$transaction(async (tx) => {
        if (employee) {
          await this.employeeService.update(
            oldMovement.employeeId,
            employee,
            avatar,
            tx,
          );
        }

        const movmentCreate = await tx.movementPersonel.update({
          where: {
            id,
          },
          data: {
            type: 'DOTATION',
            dotationType: darh?.type,
            startDate: darh?.startDate,
            endDate: darh?.endDate,
            status: darh
              ? {
                  update: {
                    startDate: darh.startDate,
                    endDate: darh.endDate,
                    gradeId: darh.gradeId,
                    affectationId: darh.affectationId,
                    initialSalary: 0,
                  },
                }
              : undefined,
          },
        });

        if (avatar) {
          const avatarName =
            'avatar_' +
            Date.now() +
            '_' +
            movement.employeeId +
            path.extname(avatar.originalname);
          const uploadedFile = await this.fileManager.updateFileToRoot({
            buffer: avatar.buffer,
            directory: 'avatar',
            fileName: avatarName,
          });
          if (uploadedFile) {
            await tx.employee.update({
              where: {
                id: movement.employeeId,
              },
              data: {
                avatar: basename(uploadedFile),
              },
            });
          }
        }

        return movmentCreate;
      });

      return successWrapper(HttpStatus.CREATED, '', movement);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const movement = await this.prisma.movementPersonel.delete({
        where: {
          id,
          type: 'DOTATION',
        },
      });
      return successWrapper(HttpStatus.OK, '', { id: movement.id });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async updateStatus(id: number, dto: MomevementStatusDTO) {
    try {
      const oldMovement = await this.prisma.movementPersonel.findFirstOrThrow({
        where: {
          id: id,
        },
        include: {
          status: {
            include: {
              grade: {
                include: {
                  salaryGrid: true,
                },
              },
            },
          },
        },
      });

      if (!isNil(oldMovement.approved)) {
        throw new UnauthorizedException('already_approved');
      }

      const movmentUpdate = await this.prisma.$transaction(async (tx) => {
        const movement = await tx.movementPersonel.update({
          where: {
            id: oldMovement.id,
          },
          data: {
            approved: dto.approved,
            status:
              dto.approved && moment().isSameOrAfter(oldMovement.startDate)
                ? {
                    update: {
                      initialSalary:
                        oldMovement.status.grade.salaryGrid?.minSalary,
                      employee: { connect: { id: oldMovement.employeeId } },
                    },
                  }
                : undefined,
          },
        });

        if (movement.approved) {
          if (
            movement.dotationType == 'CONTRACT' ||
            movement.dotationType == 'NOMINATION'
          ) {
            await tx.employee.update({
              where: {
                id: oldMovement.employeeId,
              },
              data: {
                hireDate: movement.startDate,
              },
            });
          }
          const documentType = await tx.typeDocuments.findFirst({
            where: {
              type: 'MOVEMENT',
              code: 'DOTATION_' + oldMovement.dotationType,
            },
          });

          if (!documentType)
            throw new UnprocessableEntityException('document_type_not_found');
          await tx.documents.create({
            data: {
              code: this.createDocumentCode(
                oldMovement.status.affectationId,
                documentType.id,
              ),
              date: moment().toDate(),
              description: 'New Dotation of type ' + movement.dotationType,
              createdBy: { connect: { id: 1 } },
              movement: { connect: { id: oldMovement.employeeId } },
              type: {
                connect: {
                  code: 'DOTATION_' + movement.dotationType,
                },
              },
            },
          });

          await this.documentGenerator.generateMovementDocument(
            oldMovement.id,
            tx,
          );
        }
        return movement;
      });

      return successWrapper(
        HttpStatus.OK,
        dto.approved ? 'mv_approved' : 'mv_rejected',
        { id: movmentUpdate.id },
      );
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  async generateDocument(id: number) {
    try {
      const mouvement = await this.prisma.movementPersonel.findUnique({
        where: { id },
        include: {
          status: true,
          documents: true,
        },
      });
      if (!mouvement)
        throw new UnprocessableEntityException('mouvement_not_found');
      else if (mouvement.approved)
        throw new UnprocessableEntityException('mouvement_already_approved');
      else if (mouvement.documents)
        return successWrapper(HttpStatus.OK, '', {
          generated: true,
          id: mouvement.documents.id,
        });

      const documentType = await this.prisma.typeDocuments.findFirst({
        where: {
          type: 'MOVEMENT',
          code: 'DOTATION_' + mouvement.dotationType,
        },
      });

      if (!documentType)
        throw new UnprocessableEntityException('document_type_not_found');
      const generated = await this.prisma.$transaction(async (tx) => {
        const doc = await tx.documents.create({
          data: {
            code: this.createDocumentCode(
              mouvement.status.affectationId,
              documentType.id,
            ),
            date: moment().toDate(),
            description: 'New Dotation of type ' + mouvement.dotationType,
            createdBy: { connect: { id: 1 } },
            movement: { connect: { id: mouvement.id } },
            type: {
              connect: {
                code: 'DOTATION_' + mouvement.dotationType,
              },
            },
          },
        });

        await this.documentGenerator.generateMovementDocument(mouvement.id, tx);
        return doc;
      });
      return successWrapper(HttpStatus.CREATED, '', {
        generated: true,
        id: generated.id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  private createDocumentCode(organisationId: number, typeId: number) {
    const day = moment().format('DDMMYY-HHmmss');
    return `CNT-${organisationId.toString().padStart(2, '0')}-${typeId.toString().padStart(2, '0')}-${day}`;
  }
}
