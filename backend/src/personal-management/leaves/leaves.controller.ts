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
  ParseIntPipe,
} from '@nestjs/common';
import { LeavesService } from './leaves.service.js';
import { CreateLeaveDto, CreateLeaveRequestDto } from './dto/create-leave.dto.js';
import { GetUser } from '../../auth/decorators/getUser.decorator.js';
import { UpdateLeaveDto, UpdateLeaveRequestDto } from './dto/update-leave.dto.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { dot } from 'node:test/reporters';
import { ApprobationDto } from '../../utils/dto/approbation.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}
  @Post()
  create(@Body() dto: CreateLeaveDto) {
    return this.leavesService.create(dto);
  }

  @Post('requests')
  request(@GetUser('id') userId: number, @Body() dto: CreateLeaveRequestDto) {
    return this.leavesService.create({ ...dto, employeeId: userId });
  }

  @Get('types')
  findEmployeeLeaveTypes(
    @Query('employeeId', ParseIntPipe) employeeId: number,
  ) {
    return this.leavesService.findLeaveType(employeeId);
  }

  @Get('request/types')
  findRequestTypes(@GetUser('id') employeeId: number) {
    return this.leavesService.findLeaveType(employeeId);
  }
  @Get('requests')
  getRequest(
    @GetUser('id') userId: number,
    @Query() queries?: DatabaseFilterDto,
  ) {
    return this.leavesService.findAll(queries, userId);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    console.log('the fleave');
    return this.leavesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(+id);
  }

  @Patch('request/:id')
  updateRequest(@Param('id') id: string, @Body() dto: UpdateLeaveRequestDto) {
    return this.leavesService.update(+id, dto);
  }

  @Patch('approbation/:id')
  approveLeaveRequest(
    @Param('id') id: string,
    @Body() approvation: ApprobationDto,
  ) {
    return this.leavesService.approvedLeaveRequest(+id, approvation);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeaveDto) {
    return this.leavesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavesService.remove(+id);
  }
}
