
import { PartialType } from '@nestjs/swagger';
import { CreatePrivilegeDto } from './create-privilege.dto.js';

export class UpdatePrivilegeDto extends PartialType(CreatePrivilegeDto) {}
