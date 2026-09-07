import { Global, Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller.js';
import { VercelFileManagerService } from './vercel-file-manager.service.js';
import { FileManagerService } from './file-manager.service.js';

@Global()
@Module({
  controllers: process.env.VERCEL ? [FileManagerController] : [],
  providers: [
    {
      provide: 'FILE_MANAGER_SERVICE',
      useClass: process.env.VERCEL
        ? VercelFileManagerService
        : FileManagerService,
    },
  ],
  exports: ['FILE_MANAGER_SERVICE'],
})
export class FileManagerModule {}
