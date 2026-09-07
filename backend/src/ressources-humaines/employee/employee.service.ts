import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { successWrapper } from '../../utils/common/successwrapper.js'
import path, { basename } from 'path';
import type { IFileStorage } from '../../utils/file-manager/interface/file-manager.interface.js';
import { DatabaseFilterNew } from '../../utils/dto/database-filter.dto copy.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { FormationService } from './formation/formation.service.js';
import { Prisma } from '../../utils/prisma/client.js';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formationService: FormationService,
    private readonly errorHandler: ErrorHandlerService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) {}

  async createUpdateEmployee(dto: CreateEmployeeDto) {
    try {
      const { formations, ...rest } = dto;
      const employeeCreation = await this.prisma.$transaction(async (tx) => {
        const employee = await tx.employee.create({
          data: rest,
        });
        for (const el of formations || []) {
          const { id, ...rest } = el;
          if (!id) await this.formationService.create(employee.id, rest, tx);
          else {
            await this.formationService.update(id, rest, tx);
          }
        }
        return employee;
      });

      return successWrapper(HttpStatus.CREATED, 'created', employeeCreation.id);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  async findAll(dto?: DatabaseFilterNew) {
    try {
      const { take, skip } = dto ?? {};
      const { where, orderBy } = dto?.buildFilters() ?? {};
      console.log('the filtes data', JSON.stringify(where));
      const employees = await this.prisma
        .pagination()
        .employee.findManyAndCount({
          take,
          skip,
          where,
          include: {
            movements: {
              where: {
                type: 'DOTATION',
                dotationType: 'NOMINATION',
                approved: true,
              },
            },
            status: {
              include: {
                grade: true,
                affectation: true,
                movement: true,
              },
            },
          },
        });

      return successWrapper(
        HttpStatus.OK,
        '',
        employees.data,
        employees.total,
        employees.totalFiltered,
      );
    } catch (error: any) {
      console.log('the error value', error);
      this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    avatar?: Express.Multer.File,
    tx?: Prisma.TransactionClient,
  ) {
    try {
      const transactionRequest = tx ?? this.prisma;

      const employee = await transactionRequest.employee.findUnique({
        where: { id },
      });
      if (!employee) {
        throw new NotFoundException('employee');
      }
      const { formations, ...rest } = updateEmployeeDto;
      const emp = await transactionRequest.$transaction(async (prisma) => {
        let avatarName = employee.avatar;
        if (avatar) {
          const newAvatarName =
            'avatar_' +
            Date.now() +
            '_' +
            id +
            path.extname(avatar.originalname);
          const uploadedFile = await this.fileManager.updateFileToRoot({
            buffer: avatar.buffer,
            directory: 'avatar',
            fileName: newAvatarName,
          });
          if (uploadedFile) {
            avatarName = basename(uploadedFile);
          }
        }
        await prisma.employee.update({
          where: {
            id: id,
          },
          data: {
            ...rest,
            avatar: avatarName,
          },
        });
        for (const el of formations ?? []) {
          if (!el.id)
            await this.formationService.create(employee.id, el, prisma);
          else await this.formationService.update(el.id, el, prisma);
        }
        return employee;
      });
      if (!emp) {
        throw new BadRequestException('something went wrong');
      }

      return successWrapper(HttpStatus.OK, 'employee_created', emp);
    } catch (error: any) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      const emp = await this.prisma.employee.delete({
        where: {
          id: id,
        },
      });
      return successWrapper(HttpStatus.OK, 'employee_removed', emp);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
}
