import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto.js';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { successWrapper } from '../../utils/common/successwrapper.js'
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import path from 'path';
import type { IFileStorage } from '../../utils/file-manager/interface/file-manager.interface.js';

@Injectable()
export class DocumentTypeService {
  constructor(
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,

    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(
    userId: number,
    dto: CreateDocumentTypeDto,
  ) {
    try {
      let templatePath: string | undefined;
      if (dto.template) {
        const newTemplatePath =
          'template_' + dto.type + path.extname(dto.template);
        const uploadedFile = await this.fileManager.moveFileToRoot({
          from: {
            directory: 'temp_files',
            fileName: dto.template,
          }, to: {
            directory: 'templates',
            fileName: newTemplatePath,
          }
        },);
        if (uploadedFile) {
          templatePath = path.basename(uploadedFile);
        }
      }

      const documentType = await this.prisma.typeDocuments.create({
        data: {
          type: dto.type,
          template: templatePath,
          code: dto.code,
          label: dto.label,
          description: dto.description,
          route: {
            create: dto.route?.map((route, index) => ({
              ...route,
              index: index + 1,
            })),
          },
        },
        include: {
          route: {
            include: {
              affectation: true,
            },
          },
        },
      });

      const { route, ...rest } = documentType;
      //ToDO add documentPriv
      // await this.prisma.privileges.create({
      //   data: {
      //     code: 'PRIV_' + documentType.type + '_' + documentType.code,
      //     label: 'Priv ' + documentType.type + ' ' + documentType.label,
      //   },
      // });

      await this.prisma.logs.create({
        data: {
          type: 'DOCUMENYTYPE',
          action: 'CREATE',
          userId: userId,
          logInfo: {
            documentType: { ...rest, route: route },
          },
        },
      });

      return successWrapper(HttpStatus.CREATED, 'document_type_created', rest);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }
  async update(
    userId: number,
    id: number,
    dto: UpdateDocumentTypeDto,
  ) {
    try {
      let templatePath: string | undefined;

      const oldDocumentType = await this.prisma.typeDocuments.findUnique({
        where: { id },
        include: {
          route: {
            include: {
              affectation: true,
            },
          },
        },
      });
      if (!oldDocumentType) {
        throw new NotFoundException("Document type doesn't exist");
      }
      if (dto.template) {
        const newTemplatePath =
          'template_' + dto.type + path.extname(dto.template);

        const uploadedFile = await this.fileManager.moveFileToRoot(
          {
            from: {
              directory: 'temp_files',
              fileName: dto.template,
            },
            to: {
              directory: 'templates',
              fileName: newTemplatePath,
            },
            delete: !oldDocumentType.template
              ? undefined
              : { fileName: oldDocumentType.template, directory: 'templates' },
          });
        if (uploadedFile) {
          templatePath = path.basename(uploadedFile);
        }
      }
      let lastIndex = oldDocumentType?.route.length || 0;
      if (dto.deletedRoute && dto.deletedRoute.length > 0) {
        const length = await this.prisma.documentRoute.deleteMany({
          where: {
            id: {
              in: dto.deletedRoute,
            },
          },
        });
        lastIndex -= length.count;
      }
      const updateRoute = dto.route.filter((route) => route.id);
      const newRoute = dto.route.filter((route) => !route.id);
      const updated = await this.prisma.typeDocuments.update({
        where: { id },
        data: {
          type: dto.type,
          template: templatePath,
          label: dto.label,
          description: dto.description,
          code: dto.code,
          route: {
            updateMany: updateRoute.map((route) => {
              return {
                where: { id: route.id },
                data: route,
              };
            }),
            createMany: {
              data: newRoute.map((route) => ({
                type: route.type,
                affectationId: route.affectationId,
                index: ++lastIndex,
              })),
            },
          },
        },
        include: {
          route: {
            include: {
              affectation: true,
            },
          },
        },
      });
      if (
        oldDocumentType.code != updated.code ||
        oldDocumentType.type != updated.type
      ) {
        //todo here
        // await this.prisma.privileges.update({
        //   where: {
        //     code: 'PRIV_' + oldDocumentType.type + '_' + oldDocumentType.code,
        //   },
        //   data: {
        //     code: 'PRIV_' + updated.type + '_' + updated?.code,
        //     label: 'Priv ' + updated.type + ' ' + updated.label,
        //   },
        // });
      }
      const { route, ...rest } = updated;
      await this.prisma.logs.create({
        data: {
          type: 'DOCUMENYTYPE',
          action: 'UPDATE',
          userId: userId,
          logInfo: {
            oldDocumentType: oldDocumentType,
            newDocumentType: { route, ...rest },
          },
        },
      });

      return successWrapper(HttpStatus.OK, 'Created Successfuly', rest);
    } catch (error: any) {
      console.log("the error", error)
      return this.errorHandler.handleError(error);
    }
  }

  async remove(userId: number, id: number) {
    try {
      const removed = await this.prisma.typeDocuments.delete({
        where: { id },
        include: {
          route: {
            include: {
              affectation: true,
            },
          },
        },
      });
      if (removed.template) await this.fileManager.deleteFileToRoot({
        fileName: removed.template,
        directory: 'templates',
      })
      const { route, ...rest } = removed;
      await this.prisma.logs.create({
        data: {
          type: 'DOCUMENYTYPE',
          action: 'DELETE',
          userId: userId,
          logInfo: {
            documentType: { route, ...rest },
          },
        },
      });

      return successWrapper(HttpStatus.OK, 'document_type_removed', removed);
    } catch (error) {
      console.log('the error removed', error);
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = filter?.buildData() || {};
      const affectations = await this.prisma.pagination().typeDocuments.findManyAndCount({
        where,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          route: {
            orderBy: {
              index: 'asc',
            },
            include: {
              affectation: true,
            },
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'Created Successfuly', affectations.data, affectations.total, affectations.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findByAccess(affectationId: number, query?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = query?.buildData() ?? {};
      const affectations = await this.prisma.pagination().typeDocuments.findManyAndCount({
        where: {
          ...where,
          affectationId: affectationId,
        },
        orderBy,
        take: query?.take,
        skip: query?.skip,
        include: {
          route: {
            orderBy: {
              index: 'asc',
            },
            include: {
              affectation: true,
            },
          },
        },
      });
      return successWrapper(HttpStatus.OK, 'Created Successfuly', affectations.data, affectations.total, affectations.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} documentType`;
  }
}
