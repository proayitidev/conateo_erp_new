import { HttpStatus, Injectable } from '@nestjs/common';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { CreateFeeDto } from './dto/create-fee.dto.js';
import { UpdateFeeDto } from './dto/update-fee.dto.js';


@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }
  async create(dto: CreateFeeDto) {
    try {
      const fee = await this.prisma.fees.create({
        data: dto,
      });
      return successWrapper(HttpStatus.CREATED, 'fee_created', { id: fee.id });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      const fees = await this.prisma.pagination().fees.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          grade: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', fees.data, fees.total, fees.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const fee = await this.prisma.fees.findUnique({
        where: { id }
      });
      return successWrapper(HttpStatus.OK, '', fee);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, dto: UpdateFeeDto) {
    try {
      const fee = await this.prisma.fees.update({
        where: {
          id
        },
        data: dto,
      });
      return successWrapper(HttpStatus.CREATED, 'fee_updated', { id: fee.id });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const fee = await this.prisma.fees.delete({
        where: { id }
      });
      return successWrapper(HttpStatus.CREATED, 'fee_removed', { id: fee.id });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}


