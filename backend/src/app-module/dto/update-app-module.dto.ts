import { PartialType } from '@nestjs/swagger';
import { CreateAppModuleDto } from './create-app-module.dto.js';

export class UpdateAppModuleDto extends PartialType(CreateAppModuleDto) { }
