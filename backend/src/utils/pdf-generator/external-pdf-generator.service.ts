import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import formData from 'form-data';
import type { FileDto } from '../file-manager/dto/read-file.dto.js';
import type { IFileStorage } from '../file-manager/interface/file-manager.interface.js';
import { extname } from 'path';
import * as mime from 'mime-types';

@Injectable()
export class ExternalPdfGeneratorService {
  constructor(
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
  ) { }
  async toPDF(buffer: Buffer, outData: FileDto): Promise<string> {
    const form = new formData();

    form.append('file', buffer, {
      filename: outData.fileName,
      contentType:
        mime.lookup(outData.fileName) ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const response = await axios.post(
      `https://api.nutrient.io/processor/convert_to_pdf`,
      form,
      {
        headers: form.getHeaders({
          'Authorization': `Bearer ${process.env.NUTRIENT_AUTORISATION}`
        }),
        responseType: "arraybuffer"
      }
    );

    const result = await this.fileManager.updateFileToRoot({
      buffer: Buffer.from(response.data),
      directory: outData.directory,
      fileName: outData.fileName.replace(extname(outData.fileName), '.pdf'),
    });

    return result;
  }
}
