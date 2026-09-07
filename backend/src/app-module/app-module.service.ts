import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppModuleDto } from './dto/create-app-module.dto.js';
import { UpdateAppModuleDto } from './dto/update-app-module.dto.js';
import path, { basename } from 'path';
import { successWrapper } from '../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import type { IFileStorage } from '../utils/file-manager/interface/file-manager.interface.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';

@Injectable()
export class AppModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) {}
  async create(dto: CreateAppModuleDto) {
    try {
      const appModule = await this.prisma.$transaction(async (tx) => {
        const appModule = await tx.appModule.create({
          data: {
            ...dto,
          },
        });

        const newImageName =
          'Image_module_' + appModule.id + path.extname(dto.image);
        const uploadedFile = await this.fileManager.moveFileToRoot({
          from: {
            directory: 'temp_files',
            fileName: dto.image,
          },
          to: {
            directory: 'images',
            fileName: newImageName,
          },
          returnType: 'NAME',
        });
        if (uploadedFile) {
          await tx.appModule.update({
            where: {
              id: appModule.id,
            },
            data: {
              image: uploadedFile,
            },
          });
        }

        return appModule;
      });

      return successWrapper(HttpStatus.CREATED, 'appModule_created', appModule);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      const appModules = await this.prisma.appModule.findMany({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      });
      return successWrapper(HttpStatus.OK, '', appModules);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const appModule = await this.prisma.appModule.findUnique({
        where: {
          id,
        },
      });

      return successWrapper(HttpStatus.OK, 'appModule_updated', appModule);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: string, dto: UpdateAppModuleDto) {
    try {
      const appModule = await this.prisma.$transaction(async (tx) => {
        const oldAppModule = await tx.appModule.findUnique({
          where: {
            id,
          },
        });
        if (!oldAppModule) throw new NotFoundException('module not found');

        if (dto.image && oldAppModule.image != dto.image) {
          const newImageName =
            'Image_module_' +
            oldAppModule.id +
            '_' +
            Date.now() +
            path.extname(dto.image);

          const uploadedFile = await this.fileManager.moveFileToRoot({
            from: {
              directory: 'temp_files',
              fileName: dto.image,
            },
            to: {
              directory: 'images',
              fileName: newImageName,
            },
            delete: !oldAppModule.image
              ? undefined
              : { fileName: oldAppModule.image, directory: 'images' },
          });

          if (uploadedFile) {
            dto.image = basename(uploadedFile);
          }
        }
        await tx.appModule.update({
          where: {
            id: oldAppModule.id,
          },
          data: dto,
        });
        return true;
      });

      return successWrapper(HttpStatus.OK, 'appModule_updated', { id });
    } catch (error: any) {
      console.log('the error is', error);
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const appModule = await this.prisma.appModule.delete({
        where: {
          id,
        },
      });

      return successWrapper(HttpStatus.OK, 'appModule_updated', appModule);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
