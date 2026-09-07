import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RadioCommunicationService } from './radio-communication.service.js';
import { CreateRadioStationDto } from './dto/create-radio-station.dto.js';
import { CreateRadioApplicationDto } from './dto/create-radio-application.dto.js';
import { CreateFrequencyAllocationDto } from './dto/create-frequency-allocation.dto.js';
import { CreateStationPersonnelDto } from './dto/create-station-personnel.dto.js';
import { CreateCoverageZoneDto } from './dto/create-coverage-zone.dto.js';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { RadioApplicationStatus } from '../utils/prisma/client.js';

@ApiTags('radio-communication')
@Controller('radio-communication')
export class RadioCommunicationController {
  constructor(private readonly radioCommunicationService: RadioCommunicationService) {}

  // Station endpoints
  @Post('stations')
  @ApiOperation({ summary: 'Create a new radio station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  createStation(@Body() createRadioStationDto: CreateRadioStationDto) {
    return this.radioCommunicationService.createStation(createRadioStationDto);
  }

  @Get('stations')
  @ApiOperation({ summary: 'Get all radio stations' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findAllStations() {
    return this.radioCommunicationService.findAllStations();
  }

  @Get('stations/:id')
  @ApiOperation({ summary: 'Get a radio station by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findStationById(@Param('id') id: string) {
    return this.radioCommunicationService.findStationById(id);
  }

  @Get('stations/code/:stationCode')
  @ApiOperation({ summary: 'Get a radio station by code' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findStationByCode(@Param('stationCode') stationCode: string) {
    return this.radioCommunicationService.findStationByCode(stationCode);
  }

  // Application endpoints
  @Post('applications')
  @ApiOperation({ summary: 'Create a new radio application' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  createApplication(@Body() createRadioApplicationDto: CreateRadioApplicationDto) {
    return this.radioCommunicationService.createApplication(createRadioApplicationDto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get all radio applications' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findAllApplications() {
    return this.radioCommunicationService.findAllApplications();
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get a radio application by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findApplicationById(@Param('id') id: string) {
    return this.radioCommunicationService.findApplicationById(id);
  }

  @Get('stations/:stationId/applications')
  @ApiOperation({ summary: 'Get all applications for a specific station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findApplicationsByStation(@Param('stationId') stationId: string) {
    return this.radioCommunicationService.findApplicationsByStation(stationId);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Update application status' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: RadioApplicationStatus,
  ) {
    return this.radioCommunicationService.updateApplicationStatus(id, status);
  }

  @Patch('applications/:id/payment-status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: RadioApplicationStatus,
  ) {
    return this.radioCommunicationService.updatePaymentStatus(id, paymentStatus);
  }

  @Patch('applications/:id/inspection-status')
  @ApiOperation({ summary: 'Update inspection status' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  updateInspectionStatus(
    @Param('id') id: string,
    @Body('inspectionStatus') inspectionStatus: RadioApplicationStatus,
  ) {
    return this.radioCommunicationService.updateInspectionStatus(id, inspectionStatus);
  }

  // Personnel endpoints
  @Post('stations/personnel')
  @ApiOperation({ summary: 'Add personnel to station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  addPersonnel(@Body() createStationPersonnelDto: CreateStationPersonnelDto) {
    return this.radioCommunicationService.addPersonnel(createStationPersonnelDto);
  }

  @Get('stations/:stationId/personnel')
  @ApiOperation({ summary: 'Get all personnel for a station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findPersonnelByStation(@Param('stationId') stationId: string) {
    return this.radioCommunicationService.findPersonnelByStation(stationId);
  }

  // Coverage Zone endpoints
  @Post('stations/coverage-zones')
  @ApiOperation({ summary: 'Add coverage zone to station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  addCoverageZone(@Body() createCoverageZoneDto: CreateCoverageZoneDto) {
    return this.radioCommunicationService.addCoverageZone(createCoverageZoneDto);
  }

  @Get('stations/:stationId/coverage-zones')
  @ApiOperation({ summary: 'Get all coverage zones for a station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findCoverageZonesByStation(@Param('stationId') stationId: string) {
    return this.radioCommunicationService.findCoverageZonesByStation(stationId);
  }

  // Frequency Allocation endpoints
  @Post('applications/:applicationId/frequency-allocations')
  @ApiOperation({ summary: 'Add frequency allocation to application' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  addFrequencyAllocation(
    @Param('applicationId') applicationId: string,
    @Body() createFrequencyAllocationDto: CreateFrequencyAllocationDto,
  ) {
    return this.radioCommunicationService.addFrequencyAllocation(applicationId, createFrequencyAllocationDto);
  }

  @Get('frequency-bands')
  @ApiOperation({ summary: 'Get all frequency bands' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findFrequencyBands() {
    return this.radioCommunicationService.findFrequencyBands();
  }

  // Certificate endpoints
  @Get('certificates')
  @ApiOperation({ summary: 'Get all radio certificates' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findCertificates() {
    return this.radioCommunicationService.findCertificates();
  }

  @Get('certificates/:id')
  @ApiOperation({ summary: 'Get a certificate by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findCertificateById(@Param('id') id: string) {
    return this.radioCommunicationService.findCertificateById(id);
  }

  @Get('stations/:stationId/certificates')
  @ApiOperation({ summary: 'Get all certificates for a specific station' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  findCertificatesByStation(@Param('stationId') stationId: string) {
    return this.radioCommunicationService.findCertificatesByStation(stationId);
  }

  // Dashboard endpoints
  @Get('kpis')
  @ApiOperation({ summary: 'Get DRC dashboard KPIs' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  getKpis() {
    return this.radioCommunicationService.getKpis();
  }

  @Get('total_by_frequency')
  @ApiOperation({ summary: 'Get total stations by frequency band' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  getTotalByFrequency() {
    return this.radioCommunicationService.getTotalByFrequency();
  }

  @Get('total_by_type')
  @ApiOperation({ summary: 'Get total stations by certificate type' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  getTotalByType() {
    return this.radioCommunicationService.getTotalByType();
  }
}
