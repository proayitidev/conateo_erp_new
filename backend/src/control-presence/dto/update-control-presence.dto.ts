import { PartialType } from '@nestjs/swagger';
import { CreateControlPresenceDto } from './create-control-presence.dto.js';
import { IsString, MaxLength } from 'class-validator';

export class UpdateControlPresenceDto extends PartialType(
  CreateControlPresenceDto,
) {
  @IsString()
  @MaxLength(255)
  statusReason: string;
}
