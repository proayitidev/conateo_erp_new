import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacturationDto } from './dto/create-facturation.dto.js';
import { UpdateFacturationDto } from './dto/update-facturation.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import moment from 'moment-timezone';
import { map } from 'lodash-es';
import { Console } from 'console';

@Injectable()
export class FacturationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(dto: CreateFacturationDto) {
    try {
      const {
        callType,
        operatorName,
        callerNumber,
        calledNumber,
        duration,
        date,
        startBalance,
        endBalance,
      } = dto;
      const operator = await this.operatorValues(operatorName, date);
      const operatorPrice =
        operator.callPrices[0][callType.toLocaleLowerCase()];

      const callCost = startBalance - endBalance;
      const callCostPerMin = (callCost * 60) / duration;
      const variation =
        ((callCostPerMin - operatorPrice) / operatorPrice) * 100;

      const faturation = await this.prisma.facturation.create({
        data: {
          date,
          operatorName,
          callType,
          operatorPrice,
          callerNumber,
          calledNumber,
          startTime: moment(date).toDate(),
          endTime: moment(date).add(duration, 'seconds').toDate(),
          startBalance,
          endBalance,
          duration,
          callCost,
          callCostPerMin,
          variation,
        },
      });
      return successWrapper(
        HttpStatus.CREATED,
        'facturation_created',
        faturation,
      );
    } catch (error) {
      console.log('the error ', error);
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};
      console.log('the orthr by', orderBy);
      const facturations = await this.prisma.facturation.findMany({
        where: where,
        orderBy: map(orderBy, (value, key) => ({
          [key]: value,
        })),
        take: filter?.take,
        skip: filter?.skip,
      });
      const count = await this.prisma.facturation.count();
      const filtered = await this.prisma.facturation.count({
        where: where,
      });
      return successWrapper(HttpStatus.OK, '', facturations, count, filtered);
    } catch (error) {
      console.log('the error ', error);
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    try {
      const facturation = this.prisma.withExtensions().facturation.findUnique({
        where: {
          id,
        },
      });
      return successWrapper(HttpStatus.OK, '', facturation);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOperators() {
    try {
      const operators = await this.prisma.operator.findMany();
      return successWrapper(HttpStatus.OK, '', operators);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, dto: UpdateFacturationDto) {
    try {
      const {
        callType,
        operatorName,
        callerNumber,
        calledNumber,
        duration,
        date,
        startBalance,
        endBalance,
      } = dto;

      const oldFacturation = await this.prisma.facturation.findUnique({
        where: {
          id,
        },
      });
      if (!oldFacturation) {
        throw new NotFoundException('facturation_not_found');
      }
      const operator = await this.operatorValues(
        operatorName || oldFacturation.operatorName,
        date || oldFacturation.date,
      );
      const operatorPrice =
        operator.callPrices[0][
          (callType || oldFacturation.callType)?.toLocaleLowerCase()
        ];
      const callCost =
        (startBalance || oldFacturation.startBalance) -
        (endBalance || oldFacturation.endBalance);
      const callCostPerMin =
        (callCost * 60) / (duration || oldFacturation.duration);
      const variation =
        ((callCostPerMin - operatorPrice) / operatorPrice) * 100;

      const faturation = await this.prisma.facturation.update({
        where: {
          id,
        },
        data: {
          date,
          operatorName: operator.name,
          callType: dto.callType,
          operatorPrice,
          callerNumber,
          calledNumber,
          startTime: moment(date).toDate(),
          endTime: moment(date).add(duration, 'seconds').toDate(),
          startBalance,
          endBalance,
          duration,
          callCost,
          callCostPerMin,
          variation,
        },
      });
      return successWrapper(
        HttpStatus.CREATED,
        'facturation_created',
        faturation,
      );
    } catch (error) {
      console.log('the error ', error);
      return this.errorHandler.handleError(error);
    }
  }

  private async operatorValues(name: string, date: string | Date) {
    const operator = await this.prisma.operator.findUnique({
      where: {
        name,
      },
      include: {
        callPrices: {
          where: {
            date: {
              lte: date,
            },
          },
          take: 1,
          orderBy: {
            date: 'desc',
          },
        },
      },
    });
    if (!operator) {
      throw new NotFoundException('operator_not_found');
    }
    if (operator.callPrices.length === 0) {
      throw new NotFoundException('operator_call_price_not_found');
    }
    return operator;
  }

  remove(id: number) {
    return `This action removes a #${id} facturation`;
  }
}
