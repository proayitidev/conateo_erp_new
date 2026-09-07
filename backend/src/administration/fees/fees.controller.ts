import { UseGuards, Controller, Post, Body, Get, Param, Patch, Delete, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtGuard } from "../../auth/guard/jwt.guard.js";
import { DatabaseFilterDto } from "../../utils/dto/database-filter.dto.js";
import { CreateFeeDto } from "./dto/create-fee.dto.js";
import { UpdateFeeDto } from "./dto/update-fee.dto.js";
import { FeesService } from "./fees.service.js";


@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) { }

  @Post()
  create(@Body() createFeeDto: CreateFeeDto) {
    return this.feesService.create(createFeeDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.feesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feesService.update(+id, updateFeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feesService.remove(+id);
  }
}
