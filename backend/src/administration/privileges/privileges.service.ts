import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrivilegeDto } from './dto/create-privilege.dto.js';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';

@Injectable()
export class PrivilegesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }
  async create(userId: number, dto: CreatePrivilegeDto) {
    try {
      const privileges = await this.prisma.privileges.create({
        data: {
          code: dto.code,
          label: dto.label,
        },
      });
      await this.prisma.logs.create({
        data: {
          type: 'PRIVILEGE',
          action: 'CREATE',
          userId: userId,
          logInfo: {
            id: privileges.code,
            name: privileges.code,
          },
        },
      });
      return successWrapper(
        HttpStatus.CREATED,
        'Created Successfuly',
        privileges,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      const privileges = await this.prisma.pagination().privileges.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      });

      return successWrapper(HttpStatus.OK, '', privileges.data, privileges.total, privileges.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} privilege`;
  }

  async update(userId: number, code: string, dto: UpdatePrivilegeDto) {
    try {
      const oldPriv = await this.prisma.privileges.findUnique({
        where: {
          code,
        },
      });
      const privileges = await this.prisma.privileges.update({
        where: {
          code: code,
        },
        data: {
          code: dto.code,
          label: dto.label,
        },
      });
      await this.prisma.logs.create({
        data: {
          type: 'PRIVILEGE',
          action: 'UPDATE',
          userId: userId,
          logInfo: {
            id: privileges.code,
            oldPriv: oldPriv,
            newPriv: privileges,
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'Updated Successfuly', privileges);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(userId: number, code: string) {
    try {
      const privileges = await this.prisma.privileges.delete({
        where: {
          code,
        },
      });
      await this.prisma.logs.create({
        data: {
          type: 'PRIVILEGE',
          action: 'DELETE',
          userId: userId,
          logInfo: {
            id: privileges.code,
            priv: privileges,
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'Deleted Successfuly', privileges);
    } catch (error: any) {
      console.log('its deleted', error);
      return this.errorHandler.handleError(error);
    }
  }
}
