import { Post, Body, Get, Param, Patch, Delete, Query, UseGuards, Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { RoleService } from './role.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { GetUser } from '../../auth/decorators/getUser.decorator.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(userId, createRoleDto);
  }

  @Get()
  findAll(@Query() query?: DatabaseFilterDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(userId, id, updateRoleDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.roleService.remove(userId, id);
  }
}
