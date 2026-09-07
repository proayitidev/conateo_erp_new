import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import moment from 'moment-timezone';

import { PrismaService } from '../prisma/prisma.service.js';
import { CryptrService } from '../cryptr/cryptr.service.js';
const holidays: HolidayData[] = [
  {
    name: "Jour de l'Indépendance et Jour de l'An",
    date: '01-01',
    fixed: true,
  },
  {
    name: 'Jour des Aïeux',
    date: '01-02',
    fixed: true,
  },
  {
    name: 'Mardi Gras',
    date: '02-25',
    fixed: false,
  },
  {
    name: 'Vendredi Saint',
    date: '04-18',
    fixed: false,
  },
  {
    name: "Jour de la Paix - Fête du Travail et de l'Agriculture",
    date: '05-01',
    fixed: true,
  },
  {
    name: "Jour du Drapeau et de l'Université",
    date: '05-18',
    fixed: true,
  },
  {
    name: 'Jour de la fondation de Port-au-Prince',
    date: '06-05',
    fixed: true,
  },
  {
    name: 'Assomption',
    date: '08-15',
    fixed: true,
  },
  {
    name: 'Dessalines (Jour de Dessalines)',
    date: '10-17',
    fixed: true,
  },
  {
    name: 'Toussaint',
    date: '11-01',
    fixed: true,
  },
  {
    name: 'Jour des Morts',
    date: '11-02',
    fixed: true,
  },
  {
    name: 'Bataille de Vertières',
    date: '11-18',
    fixed: true,
  },
  {
    name: "Découverte d'Haïti (Anciennement Jour de Colomb)",
    date: '12-05',
    fixed: true,
  },
  {
    name: 'Noël',
    date: '12-25',
    fixed: true,
  },
];
@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cryptr: CryptrService,
  ) { }
  private readonly logger = new Logger(TaskService.name);

  @Timeout('initialisation_check', 5000)
  async startup() {
    await this.createHolidays();
    await this.updateMovement();
    await this.updateEmployeePresence();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'update_everyday_data_midnight',
    timeZone: 'America/Port-au-Prince',
  })
  async updateEverydayDataMidnight(): Promise<void> {
    try {
      await this.updateMovement();
      await this.updateEmployeePresence();
    } catch (error) {
      this.logger.error('Error updating agent status: ' + error);
    }
  }

  async updateMovement() {
    try {
      const startOfDay = moment().startOf('day').toDate();
      await this.prisma.movementPersonel.updateMany({
        where: {
          startDate: {
            lte: startOfDay,
          },
          approved: {
            equals: null,
          },
        },
        data: {
          approved: false,
        },
      });

      const movement = await this.prisma.movementPersonel.findMany({
        where: {
          approved: true,
          documents: {
            status: 'signed',
          },
          OR: [
            {
              startDate: {
                lte: startOfDay,
              },
              endDate: {
                gte: startOfDay,
              },
            },
            {
              startDate: {
                lte: startOfDay,
              },
              endDate: {
                equals: null,
              },
            },
          ],
        },
        include: {
          status: {
            include: {
              employee: true,
            },
          },
        },
        distinct: 'employeeId',
        orderBy: {
          startDate: 'desc',
        },
      });

      for (const move of movement) {
        if (!move.status?.employee) {
          await this.prisma.employee.update({
            where: {
              id: move.employeeId,
              status: {
                id: {
                  not: move.statusId,
                },
              },
            },
            data: {
              statusId: move.statusId,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error updating agent status: ' + error);
    }
  }

  async updateEmployeePresence() {
    try {
      const today = moment().startOf('day');
      const yesterday = today.clone().subtract(1, 'day').endOf('day');
      const isHoliday = await this.prisma.holidays.findFirst({
        where: {
          date: { equals: today.toDate() },
        },
      });
      const isYesterdayHoliday = await this.prisma.holidays.findFirst({
        where: {
          date: { equals: yesterday.toDate() },
        },
      });
      if (!isYesterdayHoliday) {
        const emp = await this.prisma.employee.findMany({
          where: {
            status: {
              is: {
                OR: [
                  { endDate: { equals: null } },
                  { endDate: { gte: yesterday.toDate() } },
                ],
              },
            },
            presence: {
              none: {
                presenceDate: {
                  equals: yesterday.startOf('day').toDate(),
                },
              },
            },
          },
        });
        await this.prisma.employeePresence.createMany({
          skipDuplicates: true,
          data: emp.map((employee) => {
            return {
              employeeId: employee.id,
              presenceDate: yesterday.toDate(),
              status: 'ABSENT',
            };
          }),
        });
      }
      if (!isHoliday) {
        const employeeOnLeaves =
          await this.prisma.employeeLeavesRequest.findMany({
            where: {
              approved: true,
              startDate: {
                lte: moment().startOf('day').toDate(),
              },
              endDate: {
                gte: moment().endOf('day').toDate(),
              },
            },
            include: {
              employee: true,
            },
          });
        for (const leave of employeeOnLeaves) {
          await this.prisma.employeePresence.upsert({
            where: {
              presenceId: {
                employeeId: leave.employeeId,
                presenceDate: moment().startOf('day').toDate(),
              },
            },
            create: {
              employeeId: leave.employeeId,
              presenceDate: moment().startOf('day').toDate(),
              status: 'ON_LEAVE',
              statusReason: leave.type,
            },
            update: {},
          });
        }
      }
      this.logger.log(
        'Employee presence updated successfully for date: ' +
        today.format('YYYY-MM-DD'),
      );
    } catch (error) {
      this.logger.error('Error updating agent status: ' + error);
    }
  }

  @Cron('0 0 1 10 *', {
    name: 'reset_Fiscal_year_data',
    timeZone: 'America/Port-au-Prince',
  })
  async endAnnualFiscal() {
    try {
      const currentFiscalYear = this.prisma.getCurrentFiscalYear();
      const leaves = await this.prisma.employeeLeaveStatus.findMany({
        where: {
          carryOverAvailable: {
            gt: 0,
          },
        },
      });

      await this.prisma.carriedOverHistory.createMany({
        data: leaves.map((status) => {
          return {
            employeeId: status.employeeId,
            policyId: status.policyId,
            year: currentFiscalYear,
            amount: status.currentBalance,
          };
        }),
      });

      this.logger.log(
        'Employee leave status updated successfully for fiscal year: ' +
        currentFiscalYear,
      );
    } catch (error) {
      this.logger.error('Error updating employee leave status: ' + error);
    }
  }

  @Cron('0 0 30 3 *', {
    name: 'reset_prev_annual_leave',
    timeZone: 'America/Port-au-Prince',
  })
  async resetPrevAnnualLeave() {
    try {
      const carriedOverHistoryDeleted =
        await this.prisma.carriedOverHistory.deleteMany({
          where: {
            year: {
              lte: this.prisma.getCurrentFiscalYear(),
            },
          },
        });
      this.logger.log(
        'Total carried over history records deleted: ' +
        carriedOverHistoryDeleted.count,
      );
    } catch (error) {
      this.logger.error('Error resetting previous annual leave: ' + error);
    }
  }

  private async createHolidays() {
    try {
      const created = await this.prisma.holidays.createMany({
        data: holidays.map((val) => {
          return {
            ...val,
            date: moment(
              `${moment().year()}-${val.date}`,
              'YYYY-MM-DD',
            ).toDate(),
          };
        }),
        skipDuplicates: true,
      });
      this.logger.log('Total holidays created: ' + created.count);
    } catch (error) {
      this.logger.error(
        'Something went wong while createing admin user: ' + error,
      );
    }
  }
}

interface HolidayData {
  name: string;
  date: string;
  fixed: boolean;
}
