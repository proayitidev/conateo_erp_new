import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { successWrapper } from '../utils/common/successwrapper.js'
import { SearchDocumentDto } from './dto/search-document.dto.js';
import { Prisma } from '../utils/prisma/client.js';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService,
  ) {}

  async findAllTypes(affectationId: number) {
    try {
      const docTypes = await this.prisma.typeDocuments.findMany({
        where: {
          affectationId: affectationId,
        },
        include: {
          route: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', docTypes);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAll(
    userId: number,
    affectationId: number,
    dto: SearchDocumentDto,
    documentsAccess: string[],
  ) {
    try {
      const { search, description, typeId, date } = dto;
      const filter = {
        where: {
          type: {
            code: { in: documentsAccess },
          },
        },
      };
      if (search && search.trim() != '') {
        filter.where['OR'] = [
          { code: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }
      if (typeId) {
        filter.where['typeId'] = typeId;
      }
      if (date) {
        filter.where['date'] = date;
      }
      if (description && description.trim()) {
        filter.where['description'] = {
          contains: description.trim(),
          mode: 'insensitive',
        };
      }

      const documentCount = await this.prisma.documents.count();
      const documentCountfilterd = await this.prisma.documents.count(filter);
      let orderBy = {};
      if (dto.orderBy) {
        orderBy = dto.orderBy;
        if (orderBy['type']) {
          orderBy['type'] = {
            name: orderBy['type'],
          };
        }
      }
      const documents =
        documentCountfilterd > 0
          ? await this.prisma.documents.findMany({
              ...filter,
              orderBy: orderBy,
              take: dto.take,
              skip: dto.skip,
              include: {
                type: {
                  select: {
                    code: true,
                    label: true,
                  },
                },
              },
            })
          : [];

      // throw new NotFoundException('not found');
      return successWrapper(
        HttpStatus.OK,
        '',
        documents,
        documentCount,
        documentCountfilterd,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async summary(
    affectationId: number,
    documentAccess: string[],
    groupBy:
      | Prisma.DocumentsScalarFieldEnum
      | Prisma.DocumentsScalarFieldEnum[],
    include: any,
  ) {
    try {
      const filter = {
        where: {
          type: {
            code: {
              in: documentAccess,
            },
          },
        },
      };
      const totalDocument = await this.prisma.documents.count({
        ...filter,
      });
      const by: Prisma.DocumentsScalarFieldEnum[] = [];
      if (Array.isArray(groupBy)) {
        by.push(...groupBy);
      } else {
        by.push(groupBy);
      }
      const documentCountfilterd = await this.prisma.documents.groupBy({
        ...filter,
        by: by,
        _count: by.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}),
      });
      if (include) {
        for (const document of documentCountfilterd) {
          for (const key of by) {
            if (key === 'typeId') {
              const type = await this.prisma.typeDocuments.findUnique({
                where: {
                  id: document[key],
                },
              });
              document['type'] = type;
            }
          }
        }
      }
      // throw new NotFoundException('not found');
      return successWrapper(
        HttpStatus.OK,
        '',
        documentCountfilterd,
        totalDocument,
      );
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async summaryByDate(affectationId: number) {
    try {
      const data = await this.prisma.$queryRaw`
  SELECT
  TO_CHAR("created_at", 'YYYY-MM-DD') AS month,
   COUNT(*)::INT as count
  
  FROM
    "Documents" 
 where "typeId" IN (SELECT "typeDocumentId" FROM "DocumentRoute" WHERE "affectationId" = ${affectationId})
  GROUP BY
    month
  ORDER BY
  month ASC;
`;
      // throw new NotFoundException('not found');
      return successWrapper(HttpStatus.OK, '', data);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
