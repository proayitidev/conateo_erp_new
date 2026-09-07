import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './client.js';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { Injectable } from '@nestjs/common';
import { paginationExtension } from './extention/prisma.ext.js';

// import { PrismaClient } from './client';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const pool = new PrismaPg({ connectionString: config.get('DATABASE_URL') });
    super({
      errorFormat: 'minimal',
      adapter: pool,
      transactionOptions: {
        timeout: 15000,
      },
    });
  }

  getCurrentFiscalYear(date: Date = moment().toDate()): number {
    const month = date.getMonth(); // 0-indexed (Sept = 8, Oct = 9)
    const year = date.getFullYear();
    // If month is October (9) or later, it's the next fiscal year
    return month >= 9 ? year + 1 : year;
  }

  getStartOfFiscalYear(date: Date = moment().toDate()): Date {
    const today = moment(date);
    if (today.month() < 9) {
      return today
        .subtract(1, 'year')
        .set({ month: 9, day: 1 })
        .startOf('day')
        .toDate();
    } else return today.set({ month: 9, day: 1 }).startOf('day').toDate();
  }

  withExtensions() {
    return this.$extends({
      result: {
        facturation: {
          price: {
            needs: {
              startBalance: true,
              endBalance: true,
            },
            compute({
              startBalance,
              endBalance,
            }: {
              startBalance: number;
              endBalance: number;
            }) {
              return (Number(startBalance) - Number(endBalance)).toFixed(2);
            },
          },
        },
      },
    });
  }

  pagination() {
    return this.$extends(paginationExtension());
  }
}
