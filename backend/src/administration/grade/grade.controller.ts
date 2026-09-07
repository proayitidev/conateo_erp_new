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
import { GradeService } from './grade.service.js';
import { CreateGradeDto } from './dto/create-grade.dto.js';
import { UpdateGradeDto } from './dto/update-grade.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) { }

  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto);
  }

  @Get('available')
  findAllAvailable(@Query() filter?: DatabaseFilterDto) {
    return this.gradeService.findAll(filter, true);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.gradeService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradeService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeService.remove(+id);
  }
}
