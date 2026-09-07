import { PartialType } from '@nestjs/swagger';
import { CreateMutationDto } from './create-mutation.dto.js';

export class UpdateMutationDto extends PartialType(CreateMutationDto) {}
