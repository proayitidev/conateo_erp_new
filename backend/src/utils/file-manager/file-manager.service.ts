import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ErrorHandlerService } from '../error-handler/error-handler.service.js';
import { MoveFileDto, FileDto, ReadFileDto, WriteFileDto } from './dto/read-file.dto.js';
import * as fg from 'fs/promises';
import { dirname, join, resolve, extname, basename, parse } from 'path';
import { ConfigService } from '@nestjs/config';
import moment from 'moment-timezone';

@Injectable()
export class FileManagerService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly config: ConfigService,
  ) { }

  getExtention(path: string) {
    return extname(path);
  }


  async moveFileToRoot(dto: MoveFileDto) {
    try {
      const newPath = this.buildPath(dto.to, true);
      const oldPath = this.buildPath(dto.from);

      if (!(await this.checkFileExist(oldPath))) {
        throw new NotFoundException('File Not Found');
      }
      await fg.mkdir(dirname(newPath), { recursive: true });

      // await fg.mkdir(newPath, { recursive: true });
      await fg.rename(oldPath, newPath);

      if (dto.delete) {
        this.deleteFileToRoot(dto.delete)
      }
      if (dto.returnType == 'NAME')
        return basename(newPath);
      else if (dto.returnType == 'BUFFER')
        return ""
      return newPath;
    } catch (error: any) {
      Logger.error(error);
      return this.errorHandler.handleError(error);
    }
  }

  async checkFileExist(path: string): Promise<boolean> {
    try {
      await fg.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async updateFileToRoot(dto: WriteFileDto, oldDto?: FileDto) {
    try {
      const { buffer, fileName, directory } = dto;
      const path = this.buildPath({ fileName, directory }, true);
      await fg.mkdir(dirname(path), { recursive: true });

      if (oldDto) {
        const { fileName: oldFileName, directory: oldDirectory } = oldDto;
        const oldFilePath = this.buildPath({
          fileName: oldFileName,
          directory: oldDirectory,
        });
        if (await this.checkFileExist(oldFilePath)) {
          await fg.rename(oldFilePath, path);
        } else if (!buffer) {
          throw new BadRequestException(
            'Directory not exisit, you should resend the file',
          );
        }
      }

      if (buffer) await fg.writeFile(path, buffer);
      return path;
    } catch (error) {
      Logger.error(error);
      return this.errorHandler.handleError(error);
    }
  }

  async getFile(fileDto: ReadFileDto) {
    const path = fileDto.path ? fileDto.path : this.buildPath(fileDto.file);
    if (!(await this.checkFileExist(path)))
      throw new NotFoundException('File Not Found');

    return await fg.readFile(path);
  }

  async deleteFileToRoot(dto: FileDto) {
    try {
      const { fileName, directory } = dto;
      const path = this.buildPath({ fileName, directory });
      if (await this.checkFileExist(path))
        await fg.unlink(path);
      return path;
    } catch (error) {
      console.log("the error", error)
      Logger.error(error);
      return this.errorHandler.handleError(error);
    }
  }

  buildPath(dto: FileDto, autoAddDate = false): string {
    const { fileName, directory } = dto;
    const directoryFile = join(
      resolve(
        this.config.get('DIRECTORY_PATH') ?? '../',
        `${directory ? directory : ''}`,
      ),
    );
    const filePath = parse(fileName)
    const path = join(directoryFile, autoAddDate ? `${filePath.name}_${moment().format('YYYYMMDDHHmmss')}${filePath.ext}` : fileName);
    return path;
  }
}
