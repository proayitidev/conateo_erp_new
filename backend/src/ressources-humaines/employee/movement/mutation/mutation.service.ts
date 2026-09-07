import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMutationDto } from './dto/create-mutation.dto.js';
import { UpdateMutationDto } from './dto/update-mutation.dto.js';
import { successWrapper } from '../../../../utils/common/successwrapper.js'
import { DocumentGeneratorService } from '../../../../utils/document-generator/document-generator.service.js';
import { ErrorHandlerService } from '../../../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../../../utils/prisma/prisma.service.js';
import { DatabaseFilterDto } from '../../../../utils/dto/database-filter.dto.js';
import moment from 'moment-timezone';
import { isNil, set } from 'lodash-es';
import { MomevementStatusDTO } from '../dto/movement-status.dto.js';

@Injectable()
export class MutationService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
    private readonly documentGenerator: DocumentGeneratorService,
  ) { }
  async create(dto: CreateMutationDto) {
    try {
      const employee = await this.prisma.employee.findFirstOrThrow({
        where: {
          id: dto.employeeId,
        },
        include: {
          status: true,
        },
      });
      const movement = await this.prisma.movementPersonel.create({
        data: {
          type: 'MUTATION',
          employee: { connect: { id: dto.employeeId } },
          startDate: dto.startDate,
          status: {
            create: {
              startDate: dto.startDate,
              gradeId: employee.status!.gradeId,
              affectationId: dto.affectationId,
              initialSalary: 0,
            },
          },
        },
      });
      return successWrapper(HttpStatus.CREATED, 'promotion_created', {
        id: movement.id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};
      const movements = await this.prisma.pagination().movementPersonel.findManyAndCount({
        where: {
          ...where,
          type: 'MUTATION',
        },
        orderBy: orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          status: {
            include: { affectation: true, grade: true },
          },
          documents: true,
          employee: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', movements.data, movements.total, movements.totalFiltered);
    } catch (error: any) {
      this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} mutation`;
  }

  update(id: number, updateMutationDto: UpdateMutationDto) {
    return `This action updates a #${id} mutation`;
  }

  async findEmployees(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};

      const employees = await this.prisma.employee.findMany({
        where: { ...set(where, 'status.isNot', null) },
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      });
      return successWrapper(HttpStatus.OK, '', employees);
    } catch (error) {
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
          status: true,
        },
      });
      if (!isNil(oldMovement.approved)) {
        throw new UnauthorizedException('already_approved');
      }
      const movmentUpdate = await this.prisma.$transaction(async (tx) => {
        const documentType = await tx.typeDocuments.findFirstOrThrow({
          where: {
            code: 'MV_MUTATION',
          },
        });

        const movement = await tx.movementPersonel.update({
          where: {
            id: oldMovement.id,
          },
          data: {
            approved: dto.approved,
            employee: dto.approved
              ? {
                update: {
                  statusId: oldMovement.status.id,
                },
              }
              : undefined,
          },
        });

        if (movement.approved) {
          await tx.documents.create({
            data: {
              code: this.createDocumentCode(
                oldMovement.status.affectationId,
                documentType.id,
              ),
              date: moment().toDate(),
              description: 'New Movement of type ' + movement.dotationType,
              createdBy: { connect: { id: 1 } },
              movement: { connect: { id: movement.id } },
              type: {
                connect: {
                  code: documentType.code,
                },
              },
            },
          });
        }
        return movement;
      });
      if (movmentUpdate.approved) {
        await this.documentGenerator.generateMovementDocument(oldMovement.id);
      }

      return successWrapper(
        HttpStatus.OK,
        dto.approved ? 'mv_approved' : 'mv_rejected',
        { id: movmentUpdate.id },
      );
    } catch (error) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }
  remove(id: number) {
    return `This action removes a #${id} mutation`;
  }

  createDocumentCode(organisationId: number, typeId: number) {
    const day = moment().format('DDMMYY-HHmmss');
    return `CNT-${organisationId.toString().padStart(2, '0')}-${typeId.toString().padStart(2, '0')}-${day}`;
  }
}
