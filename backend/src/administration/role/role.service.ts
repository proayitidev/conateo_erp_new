import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { successWrapper } from '../../utils/common/successwrapper.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }
  async create(userId: number, createRoleDto: CreateRoleDto) {
    console.log('the role', createRoleDto);
    const { name, rolePrivs, modulePrivs, documentPrivs } = createRoleDto;
    try {
      const roles = await this.prisma.roles.create({
        data: {
          id: name,

          rolePrivs: {
            create: rolePrivs,
          },
          documentPrivs: {
            create: documentPrivs,
          },
          modulePrivs: {
            create: modulePrivs.map((val) => ({
              moduleId: val,
            })),
          },
        },
        include: {
          rolePrivs: {
            include: {
              privilege: true,
            },
          },
        },
      });
      await this.prisma.logs.create({
        data: {
          type: 'ROLE',
          action: 'CREATE',
          userId: userId,
          logInfo: {
            role: roles,
          },
        },
      });
      return successWrapper(HttpStatus.OK, '', roles);
    } catch (error) {
      console.log('the errors', error);
      return this.errorHandler.handleError(error);
    }
  }
  async findAll(query?: DatabaseFilterDto) {
    try {
      const { where, orderBy } = query?.buildData() ?? {};

      const roles = await this.prisma.pagination().roles.findManyAndCount({
        where,
        orderBy,
        take: query?.take,
        skip: query?.skip,
        include: {
          rolePrivs: {
            include: {
              privilege: true,
            },
          },
          documentPrivs: {
            include: {
              typeDocument: true,
            },
          },
          modulePrivs: true,
        },
      });

      return successWrapper(HttpStatus.OK, '', roles.data, roles.total, roles.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  async update(userId: number, id: string, dto: UpdateRoleDto) {
    const { name } = dto;
    try {
      const oldRole = await this.prisma.roles.findUnique({
        where: {
          id,
        },
        include: {
          rolePrivs: true,
          modulePrivs: true,
        },
      });
      const roleUpdate = await this.prisma.$transaction(async (tx) => {
        if (dto.deletedPriv && dto.deletedPriv.length > 0) {
          await tx.rolePriv.deleteMany({
            where: {
              roleId: id,
              OR: dto.deletedPriv?.map((rolePriv) => ({
                privilegeId: rolePriv.privilegeId,
                accessLevel: rolePriv.accessLevel,
              })),
            },
          });
        }
        if (dto.deletedDocumentPriv && dto.deletedDocumentPriv.length > 0) {
          await tx.documentPriv.deleteMany({
            where: {
              roleId: id,
              OR: dto.deletedDocumentPriv?.map((documentPriv) => ({
                typeDocumentId: documentPriv.typeDocumentId,
                accessLevel: documentPriv.accessLevel,
              })),
            },
          });
        }
        if (dto.deletedModule && dto.deletedModule.length > 0) {
          await tx.modulePriv.deleteMany({
            where: {
              roleId: id,
              moduleId: {
                in: dto.deletedModule,
              },
            },
          });
        }

        const role = await tx.roles.update({
          where: {
            id: id,
          },
          data: {
            id: name,
            rolePrivs: dto.rolePrivs
              ? {
                createMany: {
                  data: dto.rolePrivs,
                  skipDuplicates: true,
                },
              }
              : undefined,
            documentPrivs: dto.documentPrivs
              ? {
                createMany: {
                  data: dto.documentPrivs,
                  skipDuplicates: true,
                },
              }
              : undefined,
            modulePrivs: dto.modulePrivs
              ? {
                createMany: {
                  data: dto.modulePrivs.map((val) => ({
                    moduleId: val,
                  })),
                  skipDuplicates: true,
                },
              }
              : undefined,
          },
          include: {
            rolePrivs: true,
            modulePrivs: true,
          },
        });
        return role;
      });

      await this.prisma.logs.create({
        data: {
          type: 'ROLE',
          action: 'UPDATE',
          userId: userId,
          logInfo: {
            oldRole: oldRole,
            newRole: roleUpdate,
          },
        },
      });
      return successWrapper(HttpStatus.OK, '', { id: roleUpdate.id });
    } catch (error) {
      console.log('the role', error);
      return this.errorHandler.handleError(error);
    }
  }

  async remove(userId: number, id: string) {
    try {
      const roles = await this.prisma.roles.delete({
        where: {
          id: id,
        },
        include: {
          rolePrivs: {
            include: { privilege: true },
          },
        },
      });
      await this.prisma.logs.create({
        data: {
          type: 'ROLE',
          action: 'DELETE',
          userId: userId,
          logInfo: {
            id: roles.id,
            role: roles,
          },
        },
      });
      return successWrapper(HttpStatus.OK, '', roles);
    } catch (error: any) {
      console.log("the error", error)
      return this.errorHandler.handleError(error);
    }
  }
}
