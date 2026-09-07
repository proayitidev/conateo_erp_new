import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserLogsService } from './user-logs.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { PaginationDto } from '../../utils/dto/pagination.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('user-logs')
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) { }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.userLogsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userLogsService.findOne(+id);
  }
}
