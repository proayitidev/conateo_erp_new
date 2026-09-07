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
import { MutationService } from './mutation.service.js';
import { CreateMutationDto } from './dto/create-mutation.dto.js';
import { UpdateMutationDto } from './dto/update-mutation.dto.js';
import { MomevementStatusDTO } from '../dto/movement-status.dto.js';
import { DatabaseFilterDto } from '../../../../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class MutationController {
  constructor(private readonly mutationService: MutationService) { }

  @Post()
  create(@Body() createMutationDto: CreateMutationDto) {
    return this.mutationService.create(createMutationDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.mutationService.findAll(filter);
  }

  @Get('employees')
  findAllEmployee(@Query() filter?: DatabaseFilterDto) {
    return this.mutationService.findEmployees(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mutationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMutationDto: UpdateMutationDto,
  ) {
    return this.mutationService.update(+id, updateMutationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mutationService.remove(+id);
  }
  @Patch('approbation/:id')
  updateStatus(@Param('id') id: string, @Body() mvDTO: MomevementStatusDTO) {
    return this.mutationService.updateStatus(+id, mvDTO);
  }
}
