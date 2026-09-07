import { NumerisationService } from './numerisation.service.js';
import { CreateNumerisationDto } from './dto/create-numerisation.dto.js';
import { UpdateNumerisationDto } from './dto/update-numerisation.dto.js';
import {
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Controller,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard/jwt.guard.js';
import {
  GetUser,
  GetUserDocumentAccess,
} from '../../auth/decorators/getUser.decorator.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('numerisation')
export class NumerisationController {
  constructor(private readonly numerisationService: NumerisationService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @GetUser('id') userId: number,
    @GetUserDocumentAccess({ permissions: ['CREATE'] })
    documentAccess: string[],
    @Body() createNumerisationDto: CreateNumerisationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.numerisationService.create(
      userId,
      documentAccess,
      createNumerisationDto,
      file,
    );
  }

  @Get()
  findAll() {
    return this.numerisationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.numerisationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNumerisationDto: UpdateNumerisationDto,
  ) {
    return this.numerisationService.update(+id, updateNumerisationDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.numerisationService.remove(userId, +id);
  }
  @Post(':id/sign')
  @UseInterceptors(FileInterceptor('file'))
  signDocument(
    @GetUser('id') userId: number,
    @Param('id') docId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.numerisationService.signDocument(userId, +docId, file);
  }
}
