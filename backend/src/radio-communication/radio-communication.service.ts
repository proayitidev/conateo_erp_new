import { Injectable } from '@nestjs/common';
import { CreateRadioStationDto } from './dto/create-radio-station.dto.js';
import { CreateRadioApplicationDto } from './dto/create-radio-application.dto.js';
import { CreateFrequencyAllocationDto } from './dto/create-frequency-allocation.dto.js';
import { CreateStationPersonnelDto } from './dto/create-station-personnel.dto.js';
import { CreateCoverageZoneDto } from './dto/create-coverage-zone.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';
import { RadioApplicationStatus } from '../utils/prisma/client.js';

@Injectable()
export class RadioCommunicationService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService
  ) { }

  // Station CRUD
  async createStation(createRadioStationDto: CreateRadioStationDto) {
    try {
      // const station = await this.prisma.radioStation.create({
      //   data: createRadioStationDto,
      // });
      // return station;
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAllStations() {
    try {
      return await this.prisma.radioStation.findMany({
        include: {
          applications: true,
          certificates: true,
          inspections: true,
          personnel: true,
          coverageZones: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findStationById(id: string) {
    try {
      return await this.prisma.radioStation.findUnique({
        where: { id },
        include: {
          applications: {
            include: {
              factures: true,
              certificates: true,
              allocations: true,
              certificateRenewals: true,
              inspection: true,
            },
          },
          certificates: true,
          inspections: true,
          personnel: true,
          coverageZones: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findStationByCode(stationCode: string) {
    try {
      return await this.prisma.radioStation.findUnique({
        where: { stationCode },
        include: {
          applications: true,
          certificates: true,
          inspections: true,
          personnel: true,
          coverageZones: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  // Application CRUD
  async createApplication(createRadioApplicationDto: CreateRadioApplicationDto) {
    try {
      const application = await this.prisma.radioApplication.create({
        data: {
          ...createRadioApplicationDto,
          status: RadioApplicationStatus.PENDING,
          paymentStatus: createRadioApplicationDto.paymentStatus || RadioApplicationStatus.PENDING_PAYMENT,
          inspectionStatus: RadioApplicationStatus.PENDING_INSPECTION,
        },
        include: {
          station: true,
          factures: true,
          certificates: true,
          allocations: true,
          inspection: true,
        },
      });
      return application;
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findAllApplications() {
    try {
      return await this.prisma.radioApplication.findMany({
        include: {
          station: true,
          factures: true,
          certificates: true,
          allocations: {
            include: {
              frequencyBand: true,
            },
          },
          certificateRenewals: {
            include: {
              certificate: true,
              facture: true,
              inspection: true,
            },
          },
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findApplicationById(id: string) {
    try {
      return await this.prisma.radioApplication.findUnique({
        where: { id },
        include: {
          station: true,
          factures: true,
          certificates: true,
          allocations: {
            include: {
              frequencyBand: true,
            },
          },
          certificateRenewals: {
            include: {
              certificate: true,
              facture: true,
              inspection: true,
            },
          },
          documents: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findApplicationsByStation(stationId: string) {
    try {
      return await this.prisma.radioApplication.findMany({
        where: { stationId },
        include: {
          station: true,
          factures: true,
          certificates: true,
          allocations: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async updateApplicationStatus(id: string, status: RadioApplicationStatus) {
    try {
      return await this.prisma.radioApplication.update({
        where: { id },
        data: { status },
        include: {
          station: true,
          factures: true,
          certificates: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async updatePaymentStatus(id: string, paymentStatus: RadioApplicationStatus) {
    try {
      return await this.prisma.radioApplication.update({
        where: { id },
        data: { paymentStatus },
        include: {
          station: true,
          factures: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async updateInspectionStatus(id: string, inspectionStatus: RadioApplicationStatus) {
    try {
      return await this.prisma.radioApplication.update({
        where: { id },
        data: { inspectionStatus },
        include: {
          station: true,
          inspection: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  // Personnel CRUD
  async addPersonnel(createStationPersonnelDto: CreateStationPersonnelDto) {
    try {
      const personnel = await this.prisma.stationPersonnel.create({
        data: createStationPersonnelDto,
        include: {
          station: true,
        },
      });
      return personnel;
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findPersonnelByStation(stationId: string) {
    try {
      return await this.prisma.stationPersonnel.findMany({
        where: { stationId },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  // Coverage Zone CRUD
  async addCoverageZone(createCoverageZoneDto: CreateCoverageZoneDto) {
    try {
      const zone = await this.prisma.coverageZone.create({
        data: createCoverageZoneDto,
        include: {
          station: true,
        },
      });
      return zone;
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findCoverageZonesByStation(stationId: string) {
    try {
      return await this.prisma.coverageZone.findMany({
        where: { stationId },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  // Frequency Allocation
  async addFrequencyAllocation(applicationId: string, createFrequencyAllocationDto: CreateFrequencyAllocationDto) {
    try {
      const allocation = await this.prisma.frequencyAllocation.create({
        data: {
          ...createFrequencyAllocationDto,
          applicationId,
        },
        include: {
          frequencyBand: true,
          application: {
            include: {
              station: true,
            },
          },
        },
      });
      return allocation;
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findFrequencyBands() {
    try {
      return await this.prisma.frequencyBand.findMany({
        include: {
          allocations: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  // Certificate
  async findCertificates() {
    try {
      return await this.prisma.radioCertificate.findMany({
        include: {
          station: true,
          application: true,
          renewals: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findCertificateById(id: string) {
    try {
      return await this.prisma.radioCertificate.findUnique({
        where: { id },
        include: {
          station: true,
          application: true,
          renewals: {
            include: {
              inspection: true,
              facture: true,
            },
          },
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async findCertificatesByStation(stationId: string) {
    try {
      return await this.prisma.radioCertificate.findMany({
        where: { stationId },
        include: {
          application: true,
          renewals: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  // Dashboard methods
  async getKpis() {
    try {
      const totalStations = await this.prisma.radioStation.count();
      const activeStations = await this.prisma.radioStation.count({
        where: {
          certificates: {
            some: {
              expiryDate: {
                gte: new Date(),
              },
            },
          },
        },
      });
      const pendingRequests = await this.prisma.radioApplication.count({
        where: {
          status: {
            in: [
              "PENDING",
              "PENDING_PAYMENT",
              "PAYMENT_RECEIVED",
              "PENDING_INSPECTION",
              "PENDING_CERTIFICATE",
              "PENDING_RENEWAL"],
          },
        },
      });
      const totalLicenses = await this.prisma.radioCertificate.count({
        where: {
          certificateType: 'STATION_LICENSE',
        },
      });

      return {
        totalStations,
        activeStations,
        pendingRequests,
        totalLicenses,
      };
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async getTotalByFrequency() {
    try {
      const frequencyBands = await this.prisma.frequencyBand.findMany({
        include: {
          allocations: true,
        },
      });

      return frequencyBands.map(band => ({
        frequency: band.name,
        _count: band.allocations.length,
      }));
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  async getTotalByType() {
    try {
      const certificates = await this.prisma.radioCertificate.groupBy({
        by: ['certificateType'],
        _count: {
          certificateType: true,
        },
      });

      return certificates.map(cert => ({
        stationType: cert.certificateType,
        _count: cert._count.certificateType,
      }));
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }
}
