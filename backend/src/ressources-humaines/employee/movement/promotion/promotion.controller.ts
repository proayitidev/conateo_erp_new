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
import { PromotionService } from './promotion.service.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';
import { DatabaseFilterDto } from '../../../../utils/dto/database-filter.dto.js';
import { MomevementStatusDTO } from '../dto/movement-status.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.promotionService.findAll(filter);
  }
  @Get('employees')
  findAllEmployee(@Query() filter?: DatabaseFilterDto) {
    return this.promotionService.findEmployees(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionService.update(+id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(+id);
  }

  @Patch('approbation/:id')
  updateStatus(@Param('id') id: string, @Body() mvDTO: MomevementStatusDTO) {
    return this.promotionService.updateStatus(+id, mvDTO);
  }
}
