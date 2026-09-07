import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DotationService } from './dotation.service.js';
import { CreateDotationDto } from './dto/create-dotation.dto.js';
import { UpdateDotationDto } from './dto/update-dotation.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { MomevementStatusDTO } from '../dto/movement-status.dto.js';
import { DatabaseFilterDto } from '../../../../utils/dto/database-filter.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SignDocumentService } from '../../../../utils/sign-document/sign-document.service.js';
import { JwtGuard } from '../../../../auth/guard/jwt.guard.js';
import { GetUser } from '../../../../auth/decorators/getUser.decorator.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class DotationController {
  constructor(
    private readonly dotationService: DotationService,
    private readonly signDocumentService: SignDocumentService
  ) { }

  @UseInterceptors(FileInterceptor('avatar'))
  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createDotationDto: CreateDotationDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.dotationService.create(userId, createDotationDto, avatar);
  }
  @Post('generate-document/:id')
  generateDocument(@Param('id') id: string) {
    return this.dotationService.generateDocument(+id)
  }

  @Post('sign-document/:id')
  signDocument(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.signDocumentService.signDocument(userId, +id)
  }
  @Get()
  findAll(@Query() filter?: DatabaseFilterDto) {
    return this.dotationService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dotationService.findOne(+id);
  }

  @UseInterceptors(FileInterceptor('avatar'))
  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() updateDotationDto: UpdateDotationDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.dotationService.update(userId, +id, updateDotationDto, avatar);
  }
  @Patch('approbation/:id')
  updateStatus(@Param('id') id: string, @Body() mvDTO: MomevementStatusDTO) {
    return this.dotationService.updateStatus(+id, mvDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dotationService.remove(+id);
  }
}
