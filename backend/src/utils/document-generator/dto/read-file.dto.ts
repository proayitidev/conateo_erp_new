import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
export class FileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  directory: string;
}

export class WriteFileDto extends FileDto {
  @IsArray()
  @Type(() => Buffer<ArrayBufferLike>)
  buffer: Buffer<ArrayBufferLike>;
}
