import { PartialType } from '@nestjs/swagger';
import { CreateSalaryGridDto } from './create-salary-grid.dto.js';

export class UpdateSalaryGridDto extends PartialType(CreateSalaryGridDto) {}
