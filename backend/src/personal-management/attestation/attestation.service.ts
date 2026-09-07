import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateAttestationDto } from './dto/create-attestation.dto.js';
import { UpdateAttestationDto } from './dto/update-attestation.dto.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { successWrapper } from '../../utils/common/successwrapper.js'
import { ApprobationDto } from '../../utils/dto/approbation.dto.js';
import { DocumentGeneratorService } from '../../utils/document-generator/document-generator.service.js';
import moment from 'moment-timezone';

@Injectable()
export class AttestationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly documentGenerator: DocumentGeneratorService,
  ) { }
  async create(dto: CreateAttestationDto) {
    try {
      const oldRequest = await this.prisma.attestationRequest.findFirst({
        where: {
          employeeId: dto.employeeId,
          createdAt: { gte: moment().subtract(3, 'month').toDate() },
        },
      });
      if (oldRequest) {
        throw new UnprocessableEntityException('attestation_request_3_months_limit');
      }
      const attestation = await this.prisma.attestationRequest.create({
        data: dto,
      });
      return successWrapper(HttpStatus.CREATED, 'attestation_request_created', {
        id: attestation.id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAll(filters?: DatabaseFilterDto, userId?: number) {
    try {
      const { where, orderBy } = filters?.buildData() || {};
      if (userId) {
        where.employeeId = userId;
      }
      const attestations = await this.prisma.pagination().attestationRequest.findManyAndCount({
        where: {
          ...where,
        },
        orderBy,
        take: filters?.take,
        skip: filters?.skip,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          document: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', attestations.data, attestations.total, attestations.totalFiltered);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
      const AttendanceRequest = await this.prisma.attestationRequest.findUnique({
        where: {
          id,
        },
      });
      return successWrapper(HttpStatus.OK, '', AttendanceRequest);
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async update(id: number, updateAttestationDto: UpdateAttestationDto) {
    try {
      await this.prisma.attestationRequest.update({
        where: {
          id,
        },
        data: updateAttestationDto,
      });
      return successWrapper(HttpStatus.OK, 'attestation_request_updated', {
        id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.attestationRequest.delete({
        where: {
          id,
        },
      });
      return successWrapper(HttpStatus.OK, 'attestation_request_deleted', {
        id,
      });
    } catch (error: any) {
      return this.errorHandler.handleError(error);
    }
  }

  async updateStatus(id: number, dto: ApprobationDto) {
    try {
      const updateStatus = await this.prisma.$transaction(async (tx) => {
        await tx.attestationRequest.update({
          where: {
            id,
          },
          data: {
            status: dto.approved ? 'approved' : 'rejected',
          },
        });
        if (dto.approved) {
          const docType = await tx.typeDocuments.findUnique({
            where: {
              type: 'ATTESTATION',
              code: 'ATTESTATION_EMPLOYEE',
            },
          });
          if (!docType) {
            throw new Error('Document type not found');
          }
          await tx.documents.create({
            data: {
              code: this.createDocumentCode(docType.id, id),
              date: moment().toDate(),
              description: 'New attestation request approved',
              attestationRequestId: id,
              typeId: docType.id,
              createdById: 1, // Assuming the system user is creating the document
            },
          });
          await this.documentGenerator.generateAttestation(id, tx);
        }
      });

      return successWrapper(
        HttpStatus.OK,
        'attestation_request_status_updated',
        {
          id,
        },
      );
    } catch (error: any) {
      console.log("the error", error)
      return this.errorHandler.handleError(error);
    }
  }

  private createDocumentCode(typeId: number, attestationId: number) {
    const day = moment().format('DDMMYY-HHmmss');
    return `CNT-${typeId.toString().padStart(2, '0')}-${attestationId.toString().padStart(2, '0')}-${day}`;
  }
}
