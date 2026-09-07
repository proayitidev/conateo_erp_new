import { HttpStatus, Injectable } from '@nestjs/common';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { PaginationDto } from '../../utils/dto/pagination.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';

@Injectable()
export class UserLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    try {
      const filter = {};
      const totalLog = await this.prisma.logs.count();
      const totalFilter = await this.prisma.logs.count(filter);

      const log = await this.prisma.logs.findMany({
        orderBy: { createdAt: 'desc' },
        ...paginationDto,
        include: {
          user: {
            select: {
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return successWrapper(
        HttpStatus.OK,
        'logs Fetched Successfully',
        log,
        totalLog,
        totalFilter,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const log = await this.prisma.logs.findUnique({ where: { id: id } });

      return successWrapper(HttpStatus.OK, 'log Found Successfuly', log);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
