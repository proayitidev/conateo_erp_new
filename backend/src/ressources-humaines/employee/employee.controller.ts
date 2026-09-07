import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { DatabaseFilterNew } from '../../utils/dto/database-filter.dto copy.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Get()
  findAll(@Query() query?: DatabaseFilterNew) {
    return this.employeeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @UseInterceptors(FileInterceptor('avatar'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.employeeService.update(+id, updateEmployeeDto, avatar);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
