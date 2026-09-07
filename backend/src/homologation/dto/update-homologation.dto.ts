import { PartialType } from '@nestjs/swagger';
import { CreateHomologationDto } from '../application/dto/create-homologation.dto.js';

export class UpdateHomologationDto extends PartialType(CreateHomologationDto) {}
