import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum ReturnType {
  PATH = 'PATH',
  NAME = 'NAME',
  BUFFER = 'BUFFER',
}
export class FileDto {
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @IsNotEmpty()
  @IsString()
  directory!: string;
}

export class MoveFileDto {
  @ValidateNested()
  @IsNotEmpty()
  from!: FileDto;

  @ValidateNested()
  @IsNotEmpty()
  to!: FileDto;

  @ValidateNested()
  @IsOptional()
  delete?: FileDto;

  @IsEnum(ReturnType)
  @IsOptional()
  returnType: ReturnType = ReturnType.PATH


}

export class ReadFileDto {
  @ValidateNested()
  @IsOptional()
  file!: FileDto;

  @ValidateIf(({ file }) => !file)
  @IsString()
  @IsNotEmpty()
  path?: string;
}

export class WriteFileDto extends FileDto {
  @IsArray()
  @Type(() => Buffer<ArrayBufferLike>)
  buffer!: Buffer<ArrayBufferLike>;
}
