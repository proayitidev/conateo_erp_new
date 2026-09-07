// import { PartialType } from '@nestjs/swagger';
// import { Transform, Type } from 'class-transformer';
// import { IsEnum, IsOptional } from 'class-validator';
// import { CreateMovementDto } from './create-movement.dto.js';
// import { SortOrder } from '@prismaClient/internal/prismaNamespace';

// class MovementOrderBy {
//   @IsOptional()
//   @IsEnum(SortOrder)
//   id?: SortOrder;

//   @IsOptional()
//   @IsEnum(SortOrder)
//   type?: SortOrder;

//   @IsOptional()
//   @IsEnum(SortOrder)
//   dotationType?: SortOrder;

//   @IsOptional()
//   @IsEnum(SortOrder)
//   createdAt?: SortOrder;

//   @IsOptional()
//   @IsEnum(SortOrder)
//   updatedAt?: SortOrder;
// }

// export class FilterMovementDto extends PartialType(CreateMovementDto) {
//   @IsOptional()
//   search?: string;

//   @IsOptional()
//   @Type(() => Number)
//   take?: number;

//   @IsOptional()
//   @Type(() => Number)
//   skip?: number;

//   @IsOptional()
//   @Transform(({ value }) => {
//     if (!value) return undefined;
//     if (typeof value === 'string') return JSON.parse(value);
//     return value;
//   })
//   @Type(() => MovementOrderBy)
//   orderBy?: MovementOrderBy;
// }
