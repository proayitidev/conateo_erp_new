import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { ErrorHandlerService } from '../../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../../utils/prisma/prisma.service.js';
import { successWrapper } from '../../utils/common/successwrapper.js'
import type { UUID } from 'crypto';
import type { IFileStorage } from '../../utils/file-manager/interface/file-manager.interface.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,

  ) { }
  async createHomologationId() {
    const fiscalEnd = this.prisma.getCurrentFiscalYear();
    const fiscalStart = fiscalEnd - 1;

    const yearSuffix = `${String(fiscalStart).slice(-2)}${String(fiscalEnd).slice(-2)}`;
    const prefix = `HOM-${yearSuffix}`;

    const lastRecord = await this.prisma.homologationApplication.findFirst({
      where: {
        id: { startsWith: prefix },
      },
      orderBy: { id: 'desc' },
    });

    const lastSequence = lastRecord ? parseInt(lastRecord.id.split('-').pop() || '0', 10) : 0;
    const nextSequence = String(lastSequence + 1).padStart(4, '0');
    console.log("the last secquest", nextSequence);
    return `${prefix}-${nextSequence}`;
  }
  async create(createApplicationDto: CreateApplicationDto) {
    // try {
    //   const applicationId = await this.createHomologationId();
    //   const { documents } = createApplicationDto;

    //   const technical_specs = documents.technicalSpecs ? await this.fileManager.moveFileToRoot({
    //     from: {
    //       directory: 'temp_files',
    //       fileName: documents.technicalSpecs,
    //     }, to: {
    //       directory: 'homologation',
    //       fileName: `TECHNICAL_SPECS_${applicationId}.${extname(documents.technicalSpecs)}`,
    //     },
    //     returnType: 'NAME'
    //   },) : null;
    //   const testReport = documents.testReports ? await this.fileManager.moveFileToRoot({
    //     from: {
    //       directory: 'temp_files',
    //       fileName: documents.testReports,
    //     }, to: {
    //       directory: 'homologation',
    //       fileName: `TEST_REPORTS_${applicationId}.${extname(documents.testReports)}`,
    //     },
    //     returnType: 'NAME'
    //   }) : null;
    //   const fccCECrticate = await this.fileManager.moveFileToRoot({
    //     from: {
    //       directory: 'temp_files',
    //       fileName: documents.fccCECertificate,
    //     }, to: {
    //       directory: 'homologation',
    //       fileName: `FCC_CE_CERTICATATE_${applicationId}.${extname(documents.fccCECertificate)}`,
    //     },
    //     returnType: 'NAME'
    //   });
    //   const photoEquipement = await this.fileManager.moveFileToRoot({
    //     from: {
    //       directory: 'temp_files',
    //       fileName: documents.photoEquipement,
    //     }, to: {
    //       directory: 'homologation',
    //       fileName: `PHOTO_EQUIPMENT${applicationId}.${extname(documents.photoEquipement)}`,
    //     }, returnType: 'NAME'
    //   });
    //   const createDocument: { type: $Enums.DocumentType, fileUrl: string }[] = [
    //     {
    //       type: $Enums.DocumentType.PHOTO_EQUIPMENT,
    //       fileUrl: photoEquipement
    //     },
    //     {
    //       type: $Enums.DocumentType.FCC_CE_CERTIFICATE,
    //       fileUrl: fccCECrticate
    //     },];
    //   if (testReport) {
    //     createDocument.push({
    //       type: $Enums.DocumentType.TEST_REPORTS,
    //       fileUrl: testReport
    //     },)
    //   }
    //   if (technical_specs) {
    //     createDocument.push({
    //       type: $Enums.DocumentType.TECHNICAL_SPECS,
    //       fileUrl: technical_specs
    //     },)
    //   }
    //   const application = await this.prisma.homologationApplication.create({
    //     data: {
    //       id: await this.createHomologationId(),
    //       manufacturer: {
    //         connectOrCreate: {
    //           where: {
    //             name: createApplicationDto.manufacturer.name,
    //           },
    //           create: {
    //             ...createApplicationDto.manufacturer,
    //           },
    //         },
    //       },
    //       representative: {
    //         connectOrCreate: {
    //           where: {
    //             name: createApplicationDto.representative.name,
    //           },
    //           create: {
    //             ...createApplicationDto.representative,
    //           },
    //         },
    //       },
    //       equipment: {
    //         connectOrCreate: {
    //           where: {
    //             model: createApplicationDto.equipment.model,
    //           },
    //           create: {
    //             ...createApplicationDto.equipment,
    //           },
    //         },
    //       },
    //       documents: {
    //         create: createDocument
    //       }
    //     },
    //   });
    //   return successWrapper(
    //     HttpStatus.CREATED,
    //     'application_created',
    //     application,
    //   );
    // } catch (error) {
    //   return this.errorHandler.handleError(error);
    // }
  }

  async findAll(filter?: DatabaseFilterDto) {
    try {
      console.log('entredhere');
      const { where, orderBy } = filter?.buildData() || {};
      const applications = await this.prisma.homologationApplication.findMany({
        where,
        orderBy: orderBy,
        take: filter?.take,
        skip: filter?.skip,
        include: {
          manufacturer: true,
          representative: true,
          equipment: true,
          documents: true
        },
      });
      console.log('entredhere 23');

      return successWrapper(HttpStatus.OK, '', applications);
    } catch (error) {
      console.log("the error is here", error)
      return this.errorHandler.handleError(error);
    }
  }

  async findOne(id: UUID) {
    try {
      const applications = await this.prisma.homologationApplication.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          manufacturer: true,
          representative: true,
          equipment: true,
        },
      });
      return successWrapper(HttpStatus.OK, '', applications);
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  update(id: number, updateApplicationDto: UpdateApplicationDto) {
    return `This action updates a #${id} application`;
  }

  remove(id: number) {
    return `This action removes a #${id} application`;
  }
}
