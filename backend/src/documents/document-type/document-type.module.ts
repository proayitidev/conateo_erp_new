import { Module } from '@nestjs/common';
import { DocumentTypeService } from './document-type.service.js';
import { DocumentTypeController } from './document-type.controller.js';

@Module({
  controllers: [DocumentTypeController],
  providers: [DocumentTypeService],
})
export class DocumentTypeModule {}
