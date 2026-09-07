import { PartialType } from '@nestjs/swagger';
import { CreateAttestationDto } from './create-attestation.dto.js';

export class UpdateAttestationDto extends PartialType(CreateAttestationDto) {}
