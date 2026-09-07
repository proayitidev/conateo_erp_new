import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto.js';
import { UpdateOperatorDto } from './dto/update-operator.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js'
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { omit, pick } from 'lodash-es';

@Injectable()
export class OperatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}
  async create(dto: CreateOperatorDto) {
    try {
      const created = await this.prisma.operator.create({
        data: {
          name: dto.name,
          callPrices: {
            create: dto.callPrice,
          },
        },
      });

      return successWrapper(HttpStatus.CREATED, 'operator_created', created);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};
      const operators = await this.prisma.operator.findMany({
        where: omit(where, ['callPrices']),
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          callPrices: {
            where: where?.callPrices,
            take: 1,
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      const count = await this.prisma.employeePresence.count();
      const countFiltered = await this.prisma.employeePresence.count({
        where: where,
      });

      return successWrapper(HttpStatus.OK, '', operators, count, countFiltered);
    } catch (error) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} operator`;
  }

  async update(id: number, dto: UpdateOperatorDto) {
    try {
      const updated = await this.prisma.operator.update({
        where: {
          id,
        },
        data: {
          name: dto.name,
          callPrices: !dto.callPrice
            ? undefined
            : {
                upsert: {
                  where: {
                    priceDate: {
                      operatorId: id,
                      date: dto.callPrice.date,
                    },
                  },
                  create: dto.callPrice,
                  update: dto.callPrice,
                },
              },
        },
      });

      return successWrapper(HttpStatus.OK, 'operator_updated', updated);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} operator`;
  }
}
