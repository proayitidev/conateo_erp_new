import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service.js';
import { ExternalPdfGeneratorService } from './external-pdf-generator.service.js';
import 'dotenv/config';

@Module({
  providers: [
    {
      provide: 'PDF_GENERATOR_SERVICE',
      useClass: process.env.GOTENBERG_URL
        ? ExternalPdfGeneratorService
        : PdfGeneratorService,
    },
  ],
  exports: ['PDF_GENERATOR_SERVICE'],
})
export class PdfGeneratorModule { }
