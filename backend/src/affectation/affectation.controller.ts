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
import { AffectationService } from './affectation.service.js';
import { CreateAffectationDto } from './dto/create-affectation.dto.js';
import { UpdateAffectationDto } from './dto/update-affectation.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('affectation')
export class AffectationController {
  constructor(private readonly affectationService: AffectationService) { }

  @Post()
  create(@Body() createAffectationDto: CreateAffectationDto) {
    return this.affectationService.create(createAffectationDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.affectationService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affectationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAffectationDto: UpdateAffectationDto,
  ) {
    return this.affectationService.update(+id, updateAffectationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.affectationService.remove(+id);
  }
}
