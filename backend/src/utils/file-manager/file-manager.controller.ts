import { Controller, Get, Param, Inject, StreamableFile } from '@nestjs/common';
import type { IFileStorage } from './interface/file-manager.interface.js';

@Controller('files')
export class FileManagerController {
  constructor(
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) { }

  @Get('document/:name')
  async getDocument(@Param('name') name: string) {
    // 2. Get the stream from the service
    const { stream, contentType } = (await this.fileManager.getFile({
      file: {
        fileName: name,
        directory: 'numerisation',
      },
    })) as any;

    // 3. Return as a StreamableFile
    return new StreamableFile(stream, {
      type: contentType,
      disposition: 'attachment; filename="document.pdf"', // Optional: force download
    });
  }

  @Get('homologation/:name')
  async getHomologation(@Param('name') name: string) {
    // 2. Get the stream from the service
    const { stream, contentType } = (await this.fileManager.getFile({
      file: {
        fileName: name,
        directory: 'homologation',
      },
    })) as any;

    // 3. Return as a StreamableFile
    return new StreamableFile(stream, {
      type: contentType,
      disposition: 'attachment; filename="document.pdf"', // Optional: force download
    });
  }
  @Get('avatar/:name')
  async getAvatar(@Param('name') name: string) {
    // 2. Get the stream from the service
    const { stream, contentType } = (await this.fileManager.getFile({
      file: {
        fileName: name,
        directory: 'avatar',
      },
    })) as any;

    // 3. Return as a StreamableFile
    return new StreamableFile(stream, {
      type: contentType,
      disposition: 'attachment; filename="document.pdf"', // Optional: force download
    });
  }

  @Get('images/:name')
  async getImage(@Param('name') name: string) {
    // 2. Get the stream from the service
    const { stream, contentType } = (await this.fileManager.getFile({
      file: {
        fileName: name,
        directory: 'images',
      },
    })) as any;

    // 3. Return as a StreamableFile
    return new StreamableFile(stream, {
      type: contentType// Optional: force download
    });
  }

}
