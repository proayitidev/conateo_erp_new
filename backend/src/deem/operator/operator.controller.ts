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
import { OperatorService } from './operator.service.js';
import { CreateOperatorDto } from './dto/create-operator.dto.js';
import { UpdateOperatorDto } from './dto/update-operator.dto.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) { }

  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorService.create(createOperatorDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.operatorService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operatorService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOperatorDto: UpdateOperatorDto,
  ) {
    return this.operatorService.update(+id, updateOperatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operatorService.remove(+id);
  }
}
