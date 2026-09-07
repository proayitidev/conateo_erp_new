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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentTypeService } from './document-type.service.js';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto.js';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators/getUser.decorator.js';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import { DatabaseFilterDto } from '../../utils/dto/database-filter.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('document-type')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) { }

  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createDocumentTypeDto: CreateDocumentTypeDto,
  ) {
    return this.documentTypeService.create(
      userId,
      createDocumentTypeDto,
    );
  }

  @Get()
  findAll(@Query() filter?: DatabaseFilterDto,) {
    return this.documentTypeService.findAll(filter);
  }

  @Get('available')
  findByAccess(
    @GetUser('employee.affectationId') unitId: number,
    @Query() query?: DatabaseFilterDto,
  ) {
    return this.documentTypeService.findByAccess(unitId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentTypeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() updateDocumentTypeDto: UpdateDocumentTypeDto,
  ) {
    return this.documentTypeService.update(
      userId,
      +id,
      updateDocumentTypeDto,
    );
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.documentTypeService.remove(userId, +id);
  }
}
