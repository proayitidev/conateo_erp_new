import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AttestationService } from './attestation.service.js';
import { CreateAttestationDto } from './dto/create-attestation.dto.js';
import { UpdateAttestationDto } from './dto/update-attestation.dto.js';
import { GetUser } from '../../../auth/decorators/getUser.decorator.js';
import { JwtGuard } from '../../../auth/guard/jwt.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseFilterDto } from '../../../utils/dto/database-filter.dto.js';
import { ApprobationDto } from '../../../utils/dto/approbation.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class AttestationController {
  constructor(private readonly attestationService: AttestationService) { }

  @Post()
  create(@Body() createAttestationDto: CreateAttestationDto) {
    return this.attestationService.create(createAttestationDto);
  }

  @Post('request')
  request(@GetUser('id') userId: number) {
    return this.attestationService.create({ employeeId: userId });
  }

  @Get('request')
  getRequest(
    @GetUser('id') userId: number,
    @Query() queries?: DatabaseFilterDto,
  ) {
    return this.attestationService.findAll(queries, userId);
  }

  @Get()
  findAll(@Query() queries?: DatabaseFilterDto) {
    return this.attestationService.findAll(queries);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attestationService.findOne(+id);
  }

  @Patch('approbation/:id')
  approveLeaveRequest(
    @Param('id') id: string,
    @Body() approvation: ApprobationDto,
  ) {
    return this.attestationService.updateStatus(+id, approvation);
  }

  @Patch('request/:id')
  updateRequest(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.attestationService.update(+id, { reason });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttestationDto: UpdateAttestationDto,
  ) {
    return this.attestationService.update(+id, updateAttestationDto);
  }


  @Delete('request/:id')
  userRemove(@Param('id') id: string) {
    return this.attestationService.remove(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attestationService.remove(+id);
  }
}
