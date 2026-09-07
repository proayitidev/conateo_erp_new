import { HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment-timezone';

import { CreateHolidayDto } from './dto/create-holiday.dto.js';
import { UpdateHolidayDto } from './dto/update-holiday.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { some } from 'lodash-es';

@Injectable()
export class HolidaysService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
  ) {}
  create(createHolidayDto: CreateHolidayDto) {
    return 'This action adds a new holiday';
  }

  async findAll() {
    try {
      const hodidays = await this.prisma.holidays.findMany();
      return successWrapper(HttpStatus.OK, '', hodidays);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async countBussinessDays(
    start: string | Date | moment.Moment,
    end: string | Date | moment.Moment,
  ): Promise<number> {
    const startDate = moment(start).startOf('day');
    const endDate = moment(end).endOf('day');
    const totalHolidays = await this.prisma.holidays.findMany({
      where: {
        date: {
          gte: startDate.toDate(),
          lte: endDate.toDate(),
        },
      },
    });
    let count = endDate.diff(startDate, 'days') + 1 - totalHolidays.length;

    while (startDate.isSameOrBefore(endDate)) {
      const isWeekend = startDate.isoWeekday() >= 6; // 6 = Sat, 7 = Sun
      const isHoliday = some(totalHolidays, (holiday) => {
        return moment(holiday.date).isSame(startDate, 'day');
      });

      if (isWeekend && !isHoliday) {
        count--;
      }
      startDate.add(1, 'days');
    }

    return count;
  }

  findOne(id: number) {
    return `This action returns a #${id} holiday`;
  }

  update(id: number, updateHolidayDto: UpdateHolidayDto) {
    return `This action updates a #${id} holiday`;
  }

  remove(id: number) {
    return `This action removes a #${id} holiday`;
  }
}
