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
import { AppModuleService } from './app-module.service.js';
import { CreateAppModuleDto } from './dto/create-app-module.dto.js';
import { UpdateAppModuleDto } from './dto/update-app-module.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('app-module')
export class AppModuleController {
  constructor(private readonly appModuleService: AppModuleService) { }

  @Post()
  create(@Body() createAppModuleDto: CreateAppModuleDto) {
    return this.appModuleService.create(createAppModuleDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.appModuleService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appModuleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppModuleDto: UpdateAppModuleDto,
  ) {
    return this.appModuleService.update(id, updateAppModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appModuleService.remove(id);
  }
}
