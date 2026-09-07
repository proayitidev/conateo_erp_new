import type { FileDto } from '../../file-manager/dto/read-file.dto.js';

export interface IPDFGenerator {
  toPDF(buffer: Buffer, outData: FileDto): Promise<string>;
}
