import { HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment-timezone';

import { CreateFormationDto } from './dto/create-formation.dto.js';
import { UpdateFormationDto } from './dto/update-formation.dto.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';

@Injectable()
export class FormationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(dto: CreateFormationDto) {
    try {
      const { employees, organizers, ...rest } = dto;
      const training = await this.prisma.empTraining.create({
        data: {
          ...rest,
          employees: {
            connect: employees?.map(id => ({ id }))
          },
          organizers: {
            create: organizers.map((val) => {
              return {
                ...val
              }
            })
          }
        }
      })
      return successWrapper(HttpStatus.CREATED, 'empTraining_created', { id: training.id })

    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {}
      const formations = await this.prisma.pagination().empTraining.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          employees: true
        }
      });
      return successWrapper(HttpStatus.OK, '', formations.data, formations.total, formations.totalFiltered);

    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findEmployeeList(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {}
      console.log("The wewre", where)
      const employeeList = await this.prisma.employee.findMany({
        where: {
          ...where,
          statusId: { not: null, },
          agentStateHistories: {
            none: {
              approved: true,
              startDate: {
                lte: moment().startOf('day').toDate()
              },
              endDate: {
                gte: moment().endOf('day').toDate()
              }
            }
          }
        },
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      });
      return successWrapper(HttpStatus.OK, '', employeeList);

    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  findOne(id: number) {
    try {
      return 'This action adds a new cftdc';
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, dto: UpdateFormationDto) {
    try {
      const { employees, organizers, ...rest } = dto;
      const training = await this.prisma.empTraining.update({
        where: { id },
        data: {
          ...rest,
          employees: employees ? {
            set: employees?.map(id => ({ id }))
          } : undefined,

        }
      })
      return successWrapper(HttpStatus.OK, 'empTraining_updated', { id: training.id })

    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.empTraining.delete({
        where: {
          id
        }
      })
      return successWrapper(HttpStatus.OK, 'empTraining_deleted', { id });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}
