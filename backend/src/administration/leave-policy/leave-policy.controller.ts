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
import { LeavePolicyService } from './leave-policy.service.js';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto.js';
import {
  UpdateLeavePolicyDto,
  UpdateLeaveTierDto,
} from './dto/update-leave-policy.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('leave-policy')
export class LeavePolicyController {
  constructor(private readonly leavePolicyService: LeavePolicyService) { }

  @Post()
  create(@Body() CreateLeavePolicyDto: CreateLeavePolicyDto) {
    return this.leavePolicyService.create(CreateLeavePolicyDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.leavePolicyService.findAll(filter);
  }

  @Get('tiere')
  findAllTier() {
    return this.leavePolicyService.findAllTier();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavePolicyService.findOne(+id);
  }

  @Patch('tier/:id')
  updateTiers(@Param('id') id: string, @Body() dto: UpdateLeaveTierDto) {
    return this.leavePolicyService.updateTier(+id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeavePolicyDto) {
    return this.leavePolicyService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavePolicyService.remove(+id);
  }
}
