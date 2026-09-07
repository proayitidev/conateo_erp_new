// import { $Enums } from '../../utils/prisma/client.js';
// import {
//   IsArray,
//   IsDate,
//   IsEnum,
//   IsInt,
//   IsNotEmpty,
//   IsNumber,
//   IsOptional,
//   Min,
//   ValidateIf,
//   ValidateNested,
// } from 'class-validator';
// import { plainToClass, Transform, Type } from 'class-transformer';
// import { ApiProperty, OmitType } from '@nestjs/swagger';
// import { CreateEmployeeDto, FormationDTO } from '../../dto/create-employee.dto.js';

// export class MovementEmployeeDto extends OmitType(CreateEmployeeDto, []) {
//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true }) // Ensures each element in the array is validated
//   @Type(() => FormationDTO)
//   @ApiProperty({ isArray: true })
//   formations: FormationDTO[];
// }

// export class CreateMovementDto {
//   @IsNotEmpty()
//   @IsEnum($Enums.MovementType)
//   type: $Enums.MovementType;

//   @ValidateIf((value) => value.type == $Enums.MovementType.DOTATION)
//   @IsEnum($Enums.DotationType)
//   @IsNotEmpty()
//   dotationType?: $Enums.DotationType;

//   @ValidateIf((value) => value.type !== $Enums.MovementType.DOTATION)
//   @IsNumber()
//   @Min(1)
//   @IsNotEmpty()
//   employeeId?: number;

//   @ValidateIf((value) => value.type == $Enums.MovementType.DOTATION)
//   @Transform(
//     (data) => {
//       data.value =
//         typeof data.value === 'string'
//           ? plainToInstance(MovementEmployeeDto, JSON.parse(data.value))
//           : data.value;

//       return data.value;
//     },
//     { toClassOnly: true },
//   )
//   @ValidateNested()
//   @Type(() => MovementEmployeeDto)
//   @IsNotEmpty()
//   employee?: MovementEmployeeDto;

//   @IsNotEmpty()
//   @IsOptional()
//   @IsInt()
//   @ApiProperty({ example: '1', required: true })
//   gradeId: number;

//   @IsOptional()
//   @IsInt()
//   @ApiProperty({ example: '1', required: true })
//   fonctionId: number;

//   @IsInt()
//   @IsNotEmpty()
//   @ApiProperty({ example: '1', required: true })
//   affectationId: number;

//   @Type(() => Date)
//   @IsDate()
//   @IsNotEmpty()
//   @ApiProperty({ example: '1992/10/25', required: true })
//   startDate: Date;

//   @IsOptional()
//   @Type(() => Date)
//   @IsDate()
//   @ApiProperty({ example: '1992/10/25', required: false })
//   endDate?: Date;
// }
