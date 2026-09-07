import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';
import { NumerisationModule } from './numerisation/numerisation.module.js';
import { RouterModule } from '@nestjs/core';
import { DocumentTypeModule } from './document-type/document-type.module.js';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'documents',
        children: [NumerisationModule],
      },
    ]),
    NumerisationModule,
    DocumentTypeModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
