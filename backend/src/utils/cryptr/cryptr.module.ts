import { Global, Module } from '@nestjs/common';
import { CryptrService } from './cryptr.service.js';

@Global()
@Module({
  providers: [CryptrService],
  exports: [CryptrService],
})
export class CryptrModule {}
