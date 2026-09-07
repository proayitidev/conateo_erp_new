import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorHandlerService } from '../error-handler/error-handler.service.js';
import { FileDto, ReadFileDto, WriteFileDto } from './dto/read-file.dto.js';
import { put, del, head, get, copy } from '@vercel/blob';
import { extname, join } from 'path';
import { Readable } from 'stream';

@Injectable()
export class VercelFileManagerService {
  constructor(private readonly errorHandler: ErrorHandlerService) {
    Logger.log('FileManager: Operating strictly with Vercel Blob Storage');
  }

  getExtention(path: string) {
    return extname(path);
  }

  async getFile(dto: ReadFileDto, asBuffer: boolean = false) {
    const path = dto.path || this.buildPath(dto.file);
    const result = await get(path, {
      access: 'private',
    });
    console.log('the deotf ile', dto);
    if (!result) throw new NotFoundException('file_not_found');
    if (asBuffer) return await this.streamTOBuffer(result.stream as any);
    return {
      stream: Readable.fromWeb(result.stream as any),
      conntentType: result.blob.contentType,
    }; // Returns a ReadableStream
  }

  private async streamTOBuffer(stream: ReadableStream) {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    // 2. Loop until the stream is exhausted
    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // Exit loop when stream is finished
      if (value) {
        chunks.push(value);
      }
    }
    return Buffer.concat(chunks);
  }

  async checkFileExist(url: string): Promise<boolean> {
    try {
      await head(url);
      return true;
    } catch {
      return false;
    }
  }

  async proxyBlob(directory: string, fileName: string, res: Response) {
    try {
      // Construct the path string
      const path = directory ? `${directory}/${fileName}` : fileName;

      // In @vercel/blob ^0.23.0, the response is { blob, stream }
      const response = await get(path, { access: 'private' });

      if (!response || !response.blob) {
        throw new NotFoundException('File not found in Vercel Blob');
      }

      // 1. Get Content-Type from the blob metadata
      const contentType =
        response.blob.contentType || 'application/octet-stream';

      // 2. Convert the Web ReadableStream to a Node.js Readable stream
      // Using 'as any' because the Web Stream type isn't 1:1 with Node's fromWeb signature
      const nodeStream = Readable.fromWeb(response.stream as any);

      // 3. Set the Express headers
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Good for static assets
      });

      // 4. Pipe the data to the client
      nodeStream.pipe(res);

      // 5. Cleanup if the stream breaks
      nodeStream.on('error', (err) => {
        Logger.error('Streaming error:', err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
    } catch (error: any) {
      Logger.error(`Vercel Proxy Error: ${error.message}`);
      throw new NotFoundException('The requested file could not be retrieved');
    }
  }

  async updateFileToRoot(dto: WriteFileDto, oldDto?: FileDto): Promise<string> {
    try {
      const { buffer } = dto;

      // 1. Handle "Renaming" (Delete old, then upload new)
      if (oldDto) {
        await this.deleteFileToRoot(oldDto);
      }

      // 2. Upload to Vercel
      if (!buffer) {
        throw new BadRequestException(
          'Buffer is required for Vercel Blob uploads',
        );
      }

      // We combine directory and filename into a single path string
      const path = this.buildPath(dto);

      const blob = await put(path, buffer, {
        access: 'private',
        addRandomSuffix: true,
      });

      return blob.url;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async deleteFileToRoot(dto: FileDto) {
    try {
      const { fileName, directory } = dto;

      // In Vercel Blob, we delete using the path or the full URL
      const path = directory ? `${directory}/${fileName}` : fileName;

      await del(path);
      return path;
    } catch (error) {
      Logger.error(error);
      return this.errorHandler.handleError(error);
    }
  }
  async moveFileToRoot(oldDto: FileDto, newDto: FileDto, deleteDto?: FileDto) {
    try {
      const newPath = this.buildPath(newDto);
      const oldPath = this.buildPath(oldDto);

      if (!(await this.checkFileExist(oldPath))) {
        throw new NotFoundException('File Not Found');
      }
      // await fg.mkdir(newPath, { recursive: true });
      const blob = await copy(oldPath, newPath, {
        access: 'private',
        addRandomSuffix: true,
      });
      if (deleteDto) {
        this.deleteFileToRoot(deleteDto);
      }
      return blob.url;
    } catch (error: any) {
      Logger.error(error);
      return this.errorHandler.handleError(error);
    }
  }

  buildPath(dto: FileDto): string {
    const { fileName, directory } = dto;
    const path = join(directory ? directory : '', fileName);
    return path;
  }
}
