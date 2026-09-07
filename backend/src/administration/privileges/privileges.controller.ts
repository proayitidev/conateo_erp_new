import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PrivilegesService } from './privileges.service.js';
import { CreatePrivilegeDto } from './dto/create-privilege.dto.js';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators/getUser.decorator.js';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('privileges')
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) { }

  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createPrivilegeDto: CreatePrivilegeDto,
  ) {
    return this.privilegesService.create(userId, createPrivilegeDto);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.privilegesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.privilegesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id') code: string,
    @Body() updatePrivilegeDto: UpdatePrivilegeDto,
  ) {
    return this.privilegesService.update(userId, code, updatePrivilegeDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id') code: string) {
    return this.privilegesService.remove(userId, code);
  }
}
