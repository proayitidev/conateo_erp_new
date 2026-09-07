import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApplicationService } from './application.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import type { UUID } from 'crypto';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.applicationService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: UUID) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationService.update(+id, updateApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationService.remove(+id);
  }
}
