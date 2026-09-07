import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSalaryGridDto } from './dto/create-salary-grid.dto.js';
import { UpdateSalaryGridDto } from './dto/update-salary-grid.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';

@Injectable()
export class SalaryGridService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }
  async create(dto: CreateSalaryGridDto) {
    try {
      const prevGrade = await this.prisma.grade.findUnique({
        where: {
          id: dto.gradeId,
        },
      });
      const salaryGrid = await this.prisma.$transaction(async (tx) => {
        const newSalaryGrid = await tx.salaryGrid.create({
          data: {
            minSalary: dto.minSalary,
            maxSalary: dto.maxSalary,
            levelData: dto.levelData,
            fiscalYear: dto.fiscalYear,
            grade: {
              connect: {
                id: dto.gradeId,
              },
            },
          },
        });
        if (prevGrade && prevGrade.salaryGridId) {
          await tx.salaryGrid.update({
            where: {
              id: prevGrade.salaryGridId,
            },
            data: {
              prevGradeId: dto.gradeId,
            },
          });
        }

        return newSalaryGrid;
      });

      return successWrapper(HttpStatus.OK, '', salaryGrid);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};

      const salaryGrids = await this.prisma.pagination().salaryGrid.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          grade: true,
          prevGrade: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', salaryGrids.data, salaryGrids.total, salaryGrids.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const salaryGrid = await this.prisma.salaryGrid.findUniqueOrThrow({
        where: { id },
      });
      return successWrapper(HttpStatus.OK, '', salaryGrid);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, dto: UpdateSalaryGridDto) {
    try {
      const salaryGrid = await this.prisma.salaryGrid.update({
        where: { id },
        data: {
          minSalary: dto.minSalary,
          maxSalary: dto.maxSalary,
          levelData: dto.levelData,
        },
      });
      return successWrapper(HttpStatus.OK, '', salaryGrid);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const salaryGrid = await this.prisma.salaryGrid.delete({
        where: { id },
      });
      return successWrapper(HttpStatus.OK, '', salaryGrid);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}
