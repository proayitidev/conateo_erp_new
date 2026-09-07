import { DARHDto } from './create-dotation.dto.js';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UpdateEmployeeDto } from '../../../../../ressources-humaines/employee/dto/update-employee.dto.js';

export class UpdateDotationDto {
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      const parsed = (
        typeof value === 'string' ? JSON.parse(value) : value
      ) as Record<string, any>;
      return plainToInstance(UpdateEmployeeDto, parsed);
    },
    { toClassOnly: true },
  )
  @ValidateNested()
  @Type(() => UpdateEmployeeDto)
  employee?: UpdateEmployeeDto;

  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      const parsed = (
        typeof value === 'string' ? JSON.parse(value) : value
      ) as Record<string, any>;
      return plainToInstance(DARHDto, parsed);
    },

    { toClassOnly: true },
  )
  @ValidateNested()
  @Type(() => DARHDto)
  darh?: DARHDto;
}
