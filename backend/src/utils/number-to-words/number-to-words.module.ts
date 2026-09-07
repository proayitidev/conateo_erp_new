import {  Module } from '@nestjs/common';
import { NumberToWordsService } from './number-to-words.service.js';

@Module({
  providers: [NumberToWordsService],
  // imports: [NumberToWordsService],
})
export class NumberToWordsModule {}
