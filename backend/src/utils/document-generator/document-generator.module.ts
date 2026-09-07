import { Global, Module } from '@nestjs/common';
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module.js';
import { NumberToWordsService } from '../number-to-words/number-to-words.service.js';
import { DocumentGeneratorService } from './document-generator.service.js';
@Global()
@Module({
  imports: [PdfGeneratorModule],
  providers: [DocumentGeneratorService, NumberToWordsService],
  exports: [DocumentGeneratorService],
})
export class DocumentGeneratorModule {}
