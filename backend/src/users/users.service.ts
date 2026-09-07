/* eslint-disable @typescript-eslint/require-await */
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  NotAcceptableException,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import path from 'path';
import moment from 'moment-timezone';
import type { UUID } from 'crypto';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-role.dto.js';
import { UpdateProfilDto } from './dto/update-profil.dto.js';
import { successWrapper } from '../utils/common/successwrapper.js';
import { CryptrService } from '../utils/cryptr/cryptr.service.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import type { IFileStorage } from '../utils/file-manager/interface/file-manager.interface.js';
import { MailService } from '../utils/mail/mail.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly cryptr: CryptrService,
    private readonly errorHandler: ErrorHandlerService,
    @Inject('FILE_MANAGER_SERVICE')
    private readonly fileManager: IFileStorage,
  ) {}
  async create(userId: number, dto: CreateUserDto) {
    const { employeeId, ...rest } = dto;
    try {
      const password = this.cryptr.generatePassword({
        length: Math.random() * (16 - 8) + 8,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true,
      });
      const newUser = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            id: employeeId,
            roleId: rest.roleId,
            password: await hash(password),
          },
          include: {
            employee: true,
          },
          omit: {
            password: true,
          },
        });
        await tx.logs.create({
          data: {
            type: 'USER',
            action: 'CREATE',
            userId: userId,
            logInfo: {
              user: newUser,
            },
          },
        });
        const authen = await tx.authentification.create({
          data: {
            userId: newUser.id,
            type: 'NEWuSER',
            expiresAt: moment().add(10, 'minute').toDate(),
          },
        });
        const { email, firstName, lastName } = newUser.employee;

        await this.mailService.sendSignupOtp(
          `${email}`,
          `${firstName} ${lastName.toUpperCase()}`,
          authen.id as UUID,
          '10 Minutes',
        );
        return newUser;
      });
      return successWrapper(HttpStatus.CREATED, 'user_created', {
        id: newUser.id,
      });
    } catch (error) {
      console.log('the error is here', error);
      return this.errorHandler.handleError(error);
    }
  }

  async update(userId: number, id: number, updateUserDto: UpdateUserDto) {
    try {
      const oldUser = await this.prisma.users.findUnique({
        where: {
          id: id,
        },
      });
      const updateUser = await this.prisma.users.update({
        where: {
          id: id,
        },
        data: updateUserDto,
      });
      await this.prisma.logs.create({
        data: {
          type: 'USER',
          action: 'UPDATE',
          userId: userId,
          logInfo: {
            oldUser: oldUser,
            newUser: updateUser,
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'user_updated', updateUser);
    } catch (error: any) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }

  async remove(userId: number, id: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) throw new NotFoundException('User Not Found');
      if (user.id == userId)
        throw new UnprocessableEntityException('you cant delete your own user');
      const deleteUser = await this.prisma.users.delete({
        where: {
          id: id,
        },
      });
      await this.prisma.logs.create({
        data: {
          type: 'USER',
          action: 'DELETE',
          userId: userId,
          logInfo: {
            user: deleteUser,
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'user_removed', deleteUser);
    } catch (error: any) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      console.log('the where is here', where);
      const users = await this.prisma.pagination().users.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        omit: {
          password: true,
        },
        include: {
          role: true,
          employee: true,
        },
      });
      return successWrapper(
        HttpStatus.OK,
        '',
        users.data,
        users.total,
        users.totalFiltered,
      );
    } catch (error: any) {
      console.log('tje errer', error);
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: id,
        },
        omit: {
          password: true,
        },
        include: {
          role: {
            include: {
              rolePrivs: {
                include: {
                  privilege: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
              modulePrivs: {
                include: {
                  module: true,
                },
              },
            },
          },
          employee: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', user);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async updateProfil(
    id: number,
    dto: UpdateProfilDto,
    file?: Express.Multer.File,
  ) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: id,
        },
        include: {
          employee: true,
        },
      });
      if (!user) throw new NotFoundException('User Not Found');
      const { newPassword, oldPassword, ...rest } = dto;

      const data: any = { ...rest };
      if (newPassword) {
        if (!oldPassword)
          throw new NotAcceptableException(['please add Old Password']);
        else if ((await verify(user.password, oldPassword)) == false) {
          throw new NotFoundException('old email is Invalid');
        } else {
          data.password = await hash(newPassword);
        }
      }
      if (file) {
        const avatarName =
          'avatar_' +
          Date.now() +
          '_' +
          user.id +
          path.extname(file.originalname);
        const uploadedFile = await this.fileManager.updateFileToRoot({
          buffer: file.buffer,
          directory: 'avatar',
          fileName: avatarName,
        });
        if (uploadedFile) data.avatar = avatarName;
        if (user.employee.avatar) {
          await this.fileManager.deleteFileToRoot({
            directory: 'avatar',
            fileName: user.employee.avatar,
          });
        }
      }
      const dataVal = await this.prisma.users.update({
        where: {
          id: id,
        },
        data: data,
      });
      return successWrapper(HttpStatus.OK, 'profil_updated', dataVal);
    } catch (error) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }

  async checkModuleAccess(roleId: string, moduleId: string) {
    try {
      const roles = await this.prisma.modulePriv.findUnique({
        where: {
          rolePrivKey: { roleId, moduleId },
        },
      });
      return successWrapper(HttpStatus.OK, '', { access: !!roles });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
