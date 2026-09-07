import {
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateControlPresenceDto } from './dto/create-control-presence.dto.js';
import { UpdateControlPresenceDto } from './dto/update-control-presence.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { successWrapper } from '../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';
import { $Enums } from '../utils/prisma/client.js';
import moment from 'moment-timezone';

@Injectable()
export class ControlPresenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async getKpis(employeeId?: number) {
    try {
      const presenseStats = await this.prisma.employeePresence.groupBy({
        where: {
          employeeId,
          presenceDate: {
            gte: this.prisma.getStartOfFiscalYear(),
          },
          status: {
            notIn: ['EARLY_LEAVE', 'ON_LEAVE']
          },
        },
        by: ['status'],
        _count: {
          status: true,
          statusReason: true,
        },
      });
      const empStatus = await this.prisma.employeeLeaveStatus.count({
        where: {
          isOnLeave: true
        }
      });

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
          [$Enums.PresenceStatus.ON_LEAVE]: empStatus,
        },
      );
      return successWrapper(HttpStatus.OK, '', statusCount);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async create(dto: CreateControlPresenceDto) {
    try {
      const checkinDate = moment();
      const today = checkinDate.clone().startOf('day');
      const where: any = {};
      const { employeeId, qrCode } = dto;
      if (employeeId) where.employeeId = employeeId;
      else if (qrCode) {
        const regex = /\d{3}-\d{3}-\d{3}-\d+/; // Matches one or more digits
        const match = qrCode.match(regex);
        if (!match) {
          throw new NotAcceptableException('invalid_qr_code');
        }
        where.nif = match[0];
      }
      const employee = await this.prisma.employee.findUnique({
        where,
        include: {
          presence: {
            where: {
              presenceDate: today.toDate(),
            },
            take: 1,
          },
        },
      });
      if (!employee) {
        throw new NotFoundException('employee_not_found');
      }
      let status: $Enums.PresenceStatus = 'PRESENT';
      if (employee.presence.length == 0) {
        const lateTime = moment().set({
          hour: 9,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        if (checkinDate.isAfter(lateTime)) {
          status = 'LATE';
        } else {
          checkinDate.set({ hour: 8 }).startOf('hour');
        }
      } else {
        if (employee.presence[0].checkOutTime) {
          return successWrapper(HttpStatus.OK, 'check_out_success', null);
        }
        const supTime = moment().set({
          hour: 5,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        if (checkinDate.isBefore(supTime)) {
          checkinDate.set({ hour: 16 }).startOf('hour');
        }
      }
      const data = await this.prisma.employeePresence.upsert({
        where: {
          presenceId: {
            employeeId: employee?.id,
            presenceDate: today.toDate(),
          },
          checkOutTime: {
            equals: null,
          },
        },
        update: {
          checkOutTime: checkinDate.toDate(),
        },
        create: {
          employeeId: employee.id,
          status: status,
          checkInTime: checkinDate.toDate(),
          presenceDate: checkinDate.startOf('day').toDate(),
        },
      });
      return successWrapper(
        HttpStatus.OK,
        !data.checkOutTime ? 'check_in_success' : 'check_out_success',
        data,
      );
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() ?? {};
      console.log("the wehwre", where)
      const presences = await this.prisma.pagination().employeePresence.findManyAndCount({
        where: where,
        orderBy: orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          employee: {
            include: {
              status: {
                include: {
                  affectation: true,
                },
              },
            },
          },
        },
      });
      
      return successWrapper(200, '', presences.data, presences.total, presences.totalFiltered);
    } catch (error: any) {
      console.log("the wehwre", error);
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} controlPresence`;
  }

  update(id: number, updateControlPresenceDto: UpdateControlPresenceDto) {
    return `This action updates a #${id} controlPresence ${updateControlPresenceDto.employeeId}`;
  }

  remove(id: number) {
    return `This action removes a #${id} controlPresence`;
  }
}
