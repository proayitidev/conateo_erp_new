/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
// src/users/users.controller.ts

import {
  Controller,
  Get,
  Body,
  UseGuards,
  Post,
  Delete,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { GetUser } from '../auth/decorators/getUser.decorator.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-role.dto.js';
import { UpdateProfilDto } from './dto/update-profil.dto.js';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../utils/dto/database-filter.dto.js';

// NOTE: We're using a dummy DTO for demonstration. In a real project,
// define a separate DTO (Data Transfer Object) file.
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch('profile')
  @UseInterceptors(FileInterceptor('file'))
  updateProfil(
    @GetUser('id') userId: number,
    @Body() body: UpdateProfilDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateProfil(userId, body, file);
  }

  @Get('profile')
  getProfile(@GetUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Get('checkModuleAccess/:moduleId')
  checkModuleAccess(
    @GetUser('roleId') roleId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.usersService.checkModuleAccess(roleId, moduleId);
  }

  @Post()
  createUser(@GetUser('id') userId: number, @Body() body: CreateUserDto) {
    return this.usersService.create(userId, body);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, +id, updateUserDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.usersService.remove(userId, +id);
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.usersService.findAll(filter);
  }
}
