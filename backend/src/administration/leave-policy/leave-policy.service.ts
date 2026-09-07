import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto.js';
import {
  UpdateLeavePolicyDto,
  UpdateLeaveTierDto,
} from './dto/update-leave-policy.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
@Injectable()
export class LeavePolicyService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
  ) { }
  async create(dto: CreateLeavePolicyDto) {
    try {
      const leavePolicy = await this.prisma.leavePolicy.create({
        data: {
          type: dto.type,
          description: dto.description,
          label: dto.label,
          typeDocumentId: dto.typeDocumentId,
          leaveTiers: {
            create: dto.leaveTiers.map((tier) => ({
              ...tier,
            })),
          },
        },
      });

      return successWrapper(HttpStatus.CREATED, 'leave_policy_created', {
        id: leavePolicy.id,
      });
    } catch (error: any) {
      console.log('the value', error);
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { take, skip } = filter ?? {};
      const { where, orderBy } = filter?.buildData() ?? {};
      const leavePolicys = await this.prisma.pagination().leavePolicy.findManyAndCount({
        where,
        orderBy,
        take,
        skip,
        include: {
          leaveTiers: true,
        },
      });

      return successWrapper(HttpStatus.OK, '', leavePolicys.data, leavePolicys.total, leavePolicys.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAllTier(filter?: DatabaseFilterDto) {
    try {
      const { take, skip } = filter ?? {};
      const { where, orderBy } = filter?.buildData() ?? {};
      const leaveTier = await this.prisma.leaveTier.findMany({
        where,
        orderBy,
        take,
        skip,
      });

      return successWrapper(HttpStatus.OK, '', leaveTier);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  findOne(id: number) {
    return `This action returns a #${id} leavePolicy`;
  }

  async update(id: number, dto: UpdateLeavePolicyDto) {
    try {
      const leavePolicy = await this.prisma.leavePolicy.update({
        where: { id },
        data: {
          type: dto.type,
          label: dto.label,
          description: dto.description,
          typeDocumentId: dto.typeDocumentId,
        },
      });

      return successWrapper(HttpStatus.OK, 'leave_policy_updated', {
        id: leavePolicy.id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  async updateTier(id: number, dto: UpdateLeaveTierDto) {
    try {
      const leavePolicy = await this.prisma.leaveTier.update({
        where: { id },
        data: dto,
      });

      return successWrapper(HttpStatus.OK, 'leave_tier_updated', {
        id: leavePolicy.id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const leavePolicy = await this.prisma.leavePolicy.delete({
        where: { id },

      });

      return successWrapper(HttpStatus.OK, 'leave_policy_deleted', {
        id: leavePolicy.id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}
