import { HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { $Enums, Prisma } from '../utils/prisma/client.js';
import { successWrapper } from '../utils/common/successwrapper.js';
export type GroupByCriteria = 'GRADE' | 'AFFECTATION' | 'EMPLOYEE_TYPE';

@Injectable()
export class RessourcesHumainesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}
  async getKpis() {
    try {
      const sexe = await this.prisma.employee.groupBy({
        where: {
          statusId: { not: null },
        },
        by: ['sexe'],
        _count: {
          sexe: true,
        },
      });

      const status = await this.getEmployeeHeadcount('EMPLOYEE_TYPE');
      const statusCount = status.reduce(
        (result, item) => {
          result[item.label] += item.count;
          return result;
        },
        {
          [$Enums.EmployeeType.STAGIAIRE]: 0,
          [$Enums.EmployeeType.CONTRACTUAL]: 0,
          [$Enums.EmployeeType.FONCTIONNAIRE]: 0,
        },
      );
      const sexeCount = sexe.reduce(
        (result, item) => {
          if (item.sexe) result[item.sexe] += item._count.sexe;
          return result;
        },
        { M: 0, F: 0 },
      );
      const employee = await this.prisma.employee.count({
        where: {
          statusId: { not: null },
        },
      });
      const count = {
        ...sexeCount,
        ...statusCount,
        employee,
      };
      return successWrapper(HttpStatus.OK, '', count);
    } catch (error) {
      console.log('the error', error);
      return this.errorHandler.handleError(error);
    }
  }

  async countBy(groupBy: Prisma.EmployeeScalarFieldEnum | GroupByCriteria) {
    try {
      if (
        groupBy === 'EMPLOYEE_TYPE' ||
        groupBy === 'AFFECTATION' ||
        groupBy == 'GRADE'
      ) {
        const groupedBy = await this.getEmployeeHeadcount(groupBy);
        return successWrapper(
          HttpStatus.OK,
          '',
          groupedBy.map((value) => {
            return {
              [groupBy]: value.label,
              value: value.count,
            };
          }),
        );
      }
      const filter = (
        await this.prisma.employee.groupBy({
          by: [groupBy],
          _count: {
            [groupBy]: true,
          },
        })
      ).map((value) => {
        return {
          [groupBy]: value[groupBy],
          value: value._count[groupBy],
        };
      });
      return successWrapper(HttpStatus.OK, '', filter);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
  async getEmployeeHeadcount(
    groupBy: GroupByCriteria,
  ): Promise<{ label: string; count: number }[]> {
    switch (groupBy) {
      case 'GRADE':
        // Groups by the name of the Grade (e.g., "Senior Developer", "Agent")
        return await this.prisma.$queryRaw`
        SELECT 
          g.name AS label, 
          CAST(COUNT(e.id) AS INTEGER) AS count
        FROM "Employee" e
        JOIN "EmployeeStatus" es ON e."statusId" = es.id
        JOIN "grades" g ON es."gradeId" = g.id
        GROUP BY g.name
        ORDER BY count DESC;
      `;

      case 'AFFECTATION':
        // Groups by the name of the Affectation (e.g., "Direction Technique", "IT")
        return await this.prisma.$queryRaw`
        SELECT 
          a.name AS label, 
          CAST(COUNT(e.id) AS INTEGER) AS count
        FROM "Employee" e
        JOIN "EmployeeStatus" es ON e."statusId" = es.id
        JOIN "Affectation" a ON es."affectationId" = a.id
        GROUP BY a.name
        ORDER BY count DESC;
      `;

      case 'EMPLOYEE_TYPE':
        // Groups by the EmployeeType enum defined on the Grade (e.g., "FONCTIONNAIRE", "CONTRACTUAL")
        // We cast the enum to text to ensure it returns as a string
        return await this.prisma.$queryRaw`
        SELECT 
          g."employeeType"::text AS label, 
          CAST(COUNT(e.id) AS INTEGER) AS count
        FROM "Employee" e
        JOIN "EmployeeStatus" es ON e."statusId" = es.id
        JOIN "grades" g ON es."gradeId" = g.id
        GROUP BY g."employeeType"
        ORDER BY count DESC;
      `;
    }
  }
}
