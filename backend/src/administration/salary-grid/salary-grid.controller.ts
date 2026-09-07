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
import { SalaryGridService } from './salary-grid.service.js';
import { CreateSalaryGridDto } from './dto/create-salary-grid.dto.js';
import { UpdateSalaryGridDto } from './dto/update-salary-grid.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('salary-grid')
export class SalaryGridController {
  constructor(private readonly salaryGridService: SalaryGridService) { }

  @Post()
  create(@Body() createSalaryGridDto: CreateSalaryGridDto) {
    return this.salaryGridService.create(createSalaryGridDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.salaryGridService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryGridService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalaryGridDto: UpdateSalaryGridDto,
  ) {
    return this.salaryGridService.update(+id, updateSalaryGridDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryGridService.remove(+id);
  }
}
