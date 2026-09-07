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
import { ControlPresenceService } from './control-presence.service.js';
import { CreateControlPresenceDto } from './dto/create-control-presence.dto.js';
import { UpdateControlPresenceDto } from './dto/update-control-presence.dto.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('control-presence')
export class ControlPresenceController {
  constructor(
    private readonly controlPresenceService: ControlPresenceService,
  ) { }
  @Get('kpis')
  getKpis() {
    return this.controlPresenceService.getKpis();
  }
  @Post()
  create(@Body() createControlPresenceDto: CreateControlPresenceDto) {
    return this.controlPresenceService.create(createControlPresenceDto);
  }

  @Get()
  findAll(@Query() filter: DatabaseFilterDto) {
    return this.controlPresenceService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controlPresenceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateControlPresenceDto: UpdateControlPresenceDto,
  ) {
    return this.controlPresenceService.update(+id, updateControlPresenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controlPresenceService.remove(+id);
  }
}
