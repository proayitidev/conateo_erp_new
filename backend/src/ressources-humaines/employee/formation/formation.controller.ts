import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FormationService } from './formation.service.js';
import { CreateFormationDto } from './dto/create-formation.dto.js';
import { UpdateFormationDto } from './dto/update-formation.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class FormationController {
  constructor(private readonly formationService: FormationService) {}
  @Post(':employeeId')
  create(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() createFormationDto: CreateFormationDto,
  ) {
    return this.formationService.create(employeeId, createFormationDto);
  }

  @Get(':employeeId')
  findAll(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.formationService.findAll(employeeId);
  }

  @Get(':employeeId/:id')
  findOne(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id') id: string,
  ) {
    return this.formationService.findOne(+id);
  }

  @Patch(':employeeId/:id')
  update(
    @Param('id') id: string,
    @Body() updateFormationDto: UpdateFormationDto,
  ) {
    return this.formationService.update(+id, updateFormationDto);
  }

  @Delete(':employeeId/:id')
  remove(@Param('id') id: string) {
    return this.formationService.remove(+id);
  }
}
