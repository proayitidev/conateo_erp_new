import { PartialType } from '@nestjs/swagger';
import { CreateUserLogDto } from './create-user-log.dto.js';

export class UpdateUserLogDto extends PartialType(CreateUserLogDto) {}
