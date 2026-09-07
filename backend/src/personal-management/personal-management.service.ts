import { HttpStatus, Injectable } from '@nestjs/common';
import { successWrapper } from '../utils/common/successwrapper.js'
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { $Enums } from '../utils/prisma/client.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { get } from 'lodash-es';

@Injectable()
export class PersonalManagementService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
  ) { }

  async getStatusKPIs(employeeId: number) {
    try {
      const presenseStats = await this.prisma.employeePresence.groupBy({
        where: {
          employeeId,
          status: {
            notIn: ['EARLY_LEAVE', 'ON_LEAVE']
          },
          presenceDate: {
            gte: this.prisma.getStartOfFiscalYear(),
          },
        },
        by: ['status'],
        _count: {
          status: true,
        },
      });
      const empStatus = await this.prisma.employeeLeaveStatus.findFirst({
        where: {
          employeeId,
          policyType: "ANNUAL",
        }
      })

      const statusCount = presenseStats.reduce(
        (result, item) => {
          if (item.status) {
            result[item.status] += item._count.status;
          }

          return result;
        },
        {
          [$Enums.PresenceStatus.PRESENT]: 0,
          [$Enums.PresenceStatus.ABSENT]: 0,
          [$Enums.PresenceStatus.LATE]: 0,
          [$Enums.PresenceStatus.ON_LEAVE]: '0',
        },
      );
      statusCount[$Enums.PresenceStatus.ON_LEAVE] = `${get(empStatus, 'daysAlreadyUsed', 0)}/${get(empStatus, 'newDays', 0)}`
      return successWrapper(HttpStatus.OK, '', statusCount);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

}
