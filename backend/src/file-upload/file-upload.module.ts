import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service.js';
import { FileUploadController } from './file-upload.controller.js';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
