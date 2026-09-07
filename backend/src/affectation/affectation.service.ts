import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAffectationDto } from './dto/create-affectation.dto.js';
import { UpdateAffectationDto } from './dto/update-affectation.dto.js';
import { successWrapper } from '../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';

@Injectable()
export class AffectationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }
  async create(dto: CreateAffectationDto) {
    try {
      const { typeDocuments, ...rest } = dto;
      const affectations = await this.prisma.affectation.create({
        data: {
          ...rest,
          typeDocuments: {
            connect: typeDocuments.map((id) => ({ id })),
          },
        },
      });
      return successWrapper(HttpStatus.OK, '', affectations);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      const affectations = await this.prisma.pagination().affectation.findManyAndCount({
        where,
        orderBy,
        include: {
          typeDocuments: true,
        },
        take: filter?.take,
        skip: filter?.skip,
      });
      return successWrapper(HttpStatus.OK, '', affectations.data, affectations.total, affectations.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const affectations = await this.prisma.affectation.findUniqueOrThrow({
        where: {
          id,
        },
      });
      return successWrapper(HttpStatus.OK, '', affectations);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, dto: UpdateAffectationDto) {
    try {
      const { typeDocuments, ...rest } = dto;
      const affectations = await this.prisma.affectation.update({
        where: {
          id,
        },
        data: {
          ...rest,
          typeDocuments: !typeDocuments
            ? undefined
            : {
              connect: typeDocuments.map((id: number) => ({ id })),
            },
        },
      });
      return successWrapper(HttpStatus.OK, '', affectations);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const affectations = await this.prisma.affectation.delete({
        where: {
          id,
        },
      });
      return successWrapper(HttpStatus.OK, 'affectation', affectations);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}
