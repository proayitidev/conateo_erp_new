import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HolidaysService } from './holidays.service.js';
import { CreateHolidayDto } from './dto/create-holiday.dto.js';
import { UpdateHolidayDto } from './dto/update-holiday.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) { }

  @Post()
  create(@Body() createHolidayDto: CreateHolidayDto) {
    return this.holidaysService.create(createHolidayDto);
  }

  @Get()
  findAll() {
    return this.holidaysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holidaysService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
    return this.holidaysService.update(+id, updateHolidayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holidaysService.remove(+id);
  }
}
