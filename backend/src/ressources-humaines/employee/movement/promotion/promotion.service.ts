import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';
import { DatabaseFilterDto } from '../../../../utils/dto/database-filter.dto.js';
import { successWrapper } from '../../../../utils/common/successwrapper.js'
import { DocumentGeneratorService } from '../../../../utils/document-generator/document-generator.service.js';
import { ErrorHandlerService } from '../../../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../../../utils/prisma/prisma.service.js';
import moment from 'moment-timezone';
import { isNil } from 'lodash-es';
import { MomevementStatusDTO } from '../dto/movement-status.dto.js';

@Injectable()
export class PromotionService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
    private readonly documentGenerator: DocumentGeneratorService,
  ) { }
  async create(createPromotionDto: CreatePromotionDto) {
    try {
      const movement = await this.prisma.movementPersonel.create({
        data: {
          type: 'PROMOTION',
          employee: { connect: { id: createPromotionDto.employeeId } },
          startDate: createPromotionDto.startDate,
          status: {
            create: {
              startDate: createPromotionDto.startDate,
              gradeId: createPromotionDto.gradeId,
              affectationId: createPromotionDto.affectationId,
              initialSalary: 0,
            },
          },
        },
      });
      return successWrapper(HttpStatus.CREATED, 'promotion_created', {
        id: movement.id,
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};
      const movements = await this.prisma.pagination().movementPersonel.findManyAndCount({
        where: {
          ...where,
          type: 'PROMOTION',
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
    return `This action returns a #${id} promotion`;
  }

  update(id: number, dto: UpdatePromotionDto) {
    return `This action updates a #${id} promotion ${dto.gradeId}`;
  }

  remove(id: number) {
    return `This action removes a #${id} promotion`;
  }

  async findEmployees(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};

      const employees = await this.prisma.employee.findMany({
        where: {
          ...where,
          status: {
            grade: {
              employeeType: 'FONCTIONNAIRE',
            },
          },
        },
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
        const documentType = await tx.typeDocuments.findFirstOrThrow({
          where: {
            code: 'MV_PROMOTION',
          },
        });

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

  createDocumentCode(organisationId: number, typeId: number) {
    const day = moment().format('DDMMYY-HHmmss');
    return `CNT-${organisationId.toString().padStart(2, '0')}-${typeId.toString().padStart(2, '0')}-${day}`;
  }
}
