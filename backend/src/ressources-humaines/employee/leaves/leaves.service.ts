import { HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { successWrapper } from '../../../utils/common/successwrapper.js'
import { ErrorHandlerService } from '../../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../../utils/prisma/prisma.service.js';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { UpdateLeaveDto } from './dto/update-leave.dto.js';
import {
  ColumnFilter,
  DatabaseFilterDto,
} from '../../../utils/dto/database-filter.dto.js';
import { DocumentGeneratorService } from '../../../utils/document-generator/document-generator.service.js';
import moment from 'moment-timezone';
import { HolidaysService } from '../../../administration/holidays/holidays.service.js';
import { ApprobationDto } from '../../../utils/dto/approbation.dto.js';

@Injectable()
export class LeavesService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
    private readonly documentGenerator: DocumentGeneratorService,
    private readonly holidaysService: HolidaysService,
  ) { }
  async create(dto: CreateLeaveDto) {
    try {
      const previousLeaveRequest =
        await this.prisma.employeeLeavesRequest.findFirst({
          where: {
            employeeId: dto.employeeId,
            type: dto.type,
            approved: {
              equals: null,
            },
          },
        });
      if (previousLeaveRequest) {
        throw new UnprocessableEntityException(
          'previous_leave_request_pending',
        );
      }
      const leaveRequest = await this.prisma.$transaction(async (tx) => {
        const employeeLeaveStatus = await tx.employeeLeaveStatus.findFirst({
          where: {
            employeeId: dto.employeeId,
            policyType: dto.type,
          },
        });
        if (!employeeLeaveStatus) {
          throw new NotFoundException('employee_not_available_for_leaves');
        }

        const totalDays = await this.holidaysService.countBussinessDays(
          dto.startDate,
          dto.endDate,
        );
        if (
          totalDays >
          employeeLeaveStatus.currentBalance +
          employeeLeaveStatus.carryOverAvailable
        ) {
          throw new UnprocessableEntityException([
            'insufficient_leave_balance',
            `${employeeLeaveStatus.currentBalance +
            employeeLeaveStatus.carryOverAvailable
            }`,
          ]);
        }
        const leavePolicy = await this.prisma.leavePolicy.findUnique({
          where: { type: dto.type },
        });
        const leaveRequest = await tx.employeeLeavesRequest.create({
          data: {
            startDate: moment(dto.startDate).startOf('day').toDate(),
            endDate: moment(dto.endDate).endOf('day').toDate(),
            daysRequested: totalDays,
            reason: dto.reason || '',
            type: leavePolicy!.type,
            employee: { connect: { id: dto.employeeId } },
          },
        });
        return leaveRequest;
      });
      return successWrapper(HttpStatus.CREATED, '', leaveRequest);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto, employeeId?: number) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      if (employeeId) {
        where.employeeId = employeeId;
      }
      const leaveRequests = await this.prisma.pagination().employeeLeavesRequest.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return successWrapper(HttpStatus.OK, '', leaveRequests.data, leaveRequests.total, leaveRequests.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} leaf`;
  }

  update(id: number, dto: UpdateLeaveDto) {
    return `This action updates a #${id} leave ${dto.type}`;
  }

  remove(id: number) {
    return `This action removes a #${id} leaf`;
  }

  async findLeaveType(employeeId: number) {
    try {
      const leaveTypes = await this.prisma.employeeLeaveStatus.findMany({
        where: {
          employeeId,
        },
      });

      return successWrapper(HttpStatus.OK, '', leaveTypes);
    } catch (error: any) {
      this.errorHandler.handleError(error);
    }
  }
  async approvedLeaveRequest(id: number, dto: ApprobationDto) {
    try {
      const updateStatus = await this.prisma.$transaction(async (tx) => {
        const leaveRequest = await tx.employeeLeavesRequest.update({
          where: { id },
          data: {
            approved: dto.approved,
          },
          include: {
            document: true,
          },
        });
        if (dto.approved) {
          const leavePolicy = await tx.leavePolicy.findUniqueOrThrow({
            where: { type: leaveRequest.type },
            include: {
              typeDocument: true,
            },
          });
          console.log("the leave policy", leavePolicy)
          await tx.documents.create({
            data: {
              code: this.createDocumentCode(
                leaveRequest.id,
                leavePolicy.typeDocumentId!,
              ),
              date: moment().toDate(),
              description: 'New leave request approved',
              createdBy: { connect: { id: 1 } },
              employeeLeavesRequest: { connect: { id: leaveRequest.id } },
              type: {
                connect: {
                  id: leavePolicy.typeDocumentId!,
                },
              },
            },
          });

          await this.documentGenerator.generateLeave(leaveRequest.id, tx);
          return leaveRequest;
        }
      });
      return successWrapper(HttpStatus.OK, 'leave_request_approved', {
        id: updateStatus?.id,
      });
    } catch (error: any) {
      console.log("the error", error)
      return this.errorHandler.handleError(error);
    }
  }
  private createDocumentCode(organisationId: number, typeId: number) {
    const day = moment().format('DDMMYY-HHmmss');
    return `CNT-${organisationId.toString().padStart(2, '0')}-${typeId.toString().padStart(2, '0')}-${day}`;
  }
}
