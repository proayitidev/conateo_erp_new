import { Readable } from 'stream';
import { FileDto, ReadFileDto, WriteFileDto, MoveFileDto } from '../dto/read-file.dto.js';

export interface IFileStorage {
  getExtention(path: string): string;
  updateFileToRoot(dto: WriteFileDto, oldDto?: FileDto): Promise<string>;
  moveFileToRoot(MoveFileDto): Promise<string>;
  deleteFileToRoot(dto: FileDto): Promise<boolean>;
  getFile(
    dto: ReadFileDto,
    asBuffer?: boolean,
  ): Promise<
    | {
      stream: Readable;
      contentType: string;
    }
    | Buffer
  >;
  buildPath(dto: FileDto): string;
  checkFileExist(path: string): Promise<boolean>;
}
