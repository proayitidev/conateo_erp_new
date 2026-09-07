import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FormationsService } from './formations.service.js';
import { CreateFormationDto } from './dto/create-formation.dto.js';
import { UpdateFormationDto } from './dto/update-formation.dto.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) { }

  @Post()
  create(@Body() createFormationDto: CreateFormationDto) {
    return this.formationsService.create(createFormationDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.formationsService.findAll(filter);
  }

  @Get("employee-list")
  findEmployeeList(@Query() filter?: DatabaseFilterDto) {
    return this.formationsService.findEmployeeList(filter);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormationDto: UpdateFormationDto) {
    return this.formationsService.update(+id, updateFormationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formationsService.remove(+id);
  }
}
