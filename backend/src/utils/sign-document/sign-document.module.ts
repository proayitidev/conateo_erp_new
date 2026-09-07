import { Module } from '@nestjs/common';
import { SignDocumentService } from './sign-document.service.js';

@Module({
  providers: [SignDocumentService],
  exports: [SignDocumentService],
})
export class SignDocumentModule { }
