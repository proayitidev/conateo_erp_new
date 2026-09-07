import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FacturationService } from './facturation.service.js';
import { CreateFacturationDto } from './dto/create-facturation.dto.js';
import { UpdateFacturationDto } from './dto/update-facturation.dto.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('facturation')
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) { }

  @Post()
  create(@Body() createFacturationDto: CreateFacturationDto) {
    return this.facturationService.create(createFacturationDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.facturationService.findAll(filter);
  }

  @Get('operators')
  findOperators() {
    return this.facturationService.findOperators();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacturationDto: UpdateFacturationDto,
  ) {
    return this.facturationService.update(+id, updateFacturationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturationService.remove(+id);
  }
}
