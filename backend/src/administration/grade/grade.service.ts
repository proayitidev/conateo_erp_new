import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto.js';
import { UpdateGradeDto } from './dto/update-grade.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';

@Injectable()
export class GradeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }
  async create(dto: CreateGradeDto) {
    try {
      const grade = await this.prisma.grade.create({
        data: {
          ...dto,
        },
      });
      return successWrapper(HttpStatus.CREATED, 'grade_created', grade);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto, available: boolean = false) {
    try {
      const { where, orderBy } = filter?.buildData() || {};

      if (available) {
        where.salaryGridId = { not: null }
      }

      const grades = await this.prisma.pagination().grade.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      });

      return successWrapper(HttpStatus.OK, '', grades.data, grades.total, grades.totalFiltered);
    } catch (error: any) {
      console.log("error thle fdmsakdfas", error)
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const grades = await this.prisma.grade.findUniqueOrThrow({
        where: { id },
      });
      return successWrapper(HttpStatus.OK, '', grades);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    try {
      const grade = await this.prisma.grade.update({
        where: {
          id,
        },
        data: updateGradeDto,
      });
      return successWrapper(HttpStatus.OK, '', grade);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const deleted = await this.prisma.grade.delete({
        where: {
          id,
        },
      });
      return successWrapper(HttpStatus.OK, 'grade_deleted', deleted);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}
