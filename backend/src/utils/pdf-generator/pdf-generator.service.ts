import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { exec } from 'child_process';
import { extname, dirname } from 'path';
import type { FileDto } from '../file-manager/dto/read-file.dto.js';
import type { IFileStorage } from '../file-manager/interface/file-manager.interface.js';

@Injectable()
export class PdfGeneratorService {
  constructor(
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) { }

  async toPDF(buffer: Buffer, outData: FileDto): Promise<string> {
    const tempFile = await this.fileManager.updateFileToRoot({
      buffer: buffer,
      fileName: outData.fileName,
      directory: 'temp',
    });

    const outPathFile = this.fileManager.buildPath({
      ...outData,
      fileName: outData.fileName.replace(extname(outData.fileName), '.pdf'),
    });

    const command = `start /wait "" soffice --headless --convert-to pdf --outdir "${dirname(outPathFile)}" "${tempFile}"`;
    await new Promise<void>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(
            new UnprocessableEntityException({
              message: 'Conversion failed',
              error: stderr || error.message,
            }),
          );
        }
        resolve();
      });
    });
    return outPathFile;
    if (await this.fileManager.checkFileExist(outPathFile)) {
      return outPathFile;
    }

    throw new UnprocessableEntityException('Conversion failed');
  }
}
