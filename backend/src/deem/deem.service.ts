import { HttpStatus, Injectable } from '@nestjs/common';
import { $Enums } from '../utils/prisma/client.js';
import { successWrapper } from '../utils/common/successwrapper.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';

@Injectable()
export class DeemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async kpis() {
    try {
      const [aggregate, totalVariationGt5] = await Promise.all([
        this.prisma.facturation.aggregate({
          _count: {
            id: true,
            operatorName: true,
          },
          _avg: {
            variation: true,
          },
        }),
        this.prisma.facturation.count({
          where: {
            variation: {
              gt: 5,
            },
          },
        }),
      ]);
      const operatorCount = await this.prisma.facturation.groupBy({
        by: ['operatorName'],
      });

      return successWrapper(HttpStatus.OK, 'kpis_fetched', {
        totalFacturation: aggregate._count.id || 0,
        moyenneVariations: (aggregate._avg.variation || 0).toFixed(2),
        totalVariationGt5,
        totalOperatorName: operatorCount.length,
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async totalByOperator() {
    try {
      const totalByOp = await this.prisma.facturation.groupBy({
        by: ['operatorName'],
        _count: true,
      });
      return successWrapper(HttpStatus.OK, 'kpis_fetched', totalByOp);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async totalByType() {
    try {
      const totalByOp = await this.prisma.facturation.groupBy({
        by: ['callType'],
        _count: true,
      });
      return successWrapper(HttpStatus.OK, 'kpis_fetched', totalByOp);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async priceCompByOp(callType?: $Enums.CallType) {
    try {
      const totalByOp = await this.prisma.facturation.groupBy({
        where: {
          callType,
        },
        by: ['operatorName'],
        _avg: {
          callCostPerMin: true,
          operatorPrice: true,
        },
      });
      return successWrapper(HttpStatus.OK, 'kpis_fetched', totalByOp);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
  async priceCompByCallType(operatorName?: string) {
    try {
      const totalByOp = await this.prisma.facturation.groupBy({
        where: {
          operatorName,
        },
        by: ['callType'],
        _avg: {
          callCostPerMin: true,
          operatorPrice: true,
        },
      });
      return successWrapper(HttpStatus.OK, 'kpis_fetched', totalByOp);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
