import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEquipmentDto } from './create-equipement.dto.js';
import { CreateCompanyDto } from './create-company.dto.js';
import { HomologationDocumentDto } from './create-homologation.dto.js';

export class CreateApplicationDto {
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  manufacturer: CreateCompanyDto;

  @ValidateNested()
  @Type(() => CreateCompanyDto)
  representative: CreateCompanyDto;

  @ValidateNested()
  @Type(() => CreateEquipmentDto)
  equipment: CreateEquipmentDto;

  @ValidateNested()
  @Type(() => HomologationDocumentDto)
  documents!: HomologationDocumentDto;

  // Date de signature (ex: 18/12/2025) [cite: 49]
}
