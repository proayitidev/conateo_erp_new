import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileUploadService } from './file-upload.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) { }
  @UseInterceptors(FileInterceptor('file'))
  @Post("template")
  uploadTemplate(@UploadedFile() file: Express.Multer.File,) {
    return this.fileUploadService.uploadTemplate(file);
  }

}
