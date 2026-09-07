import { IsNotEmpty } from 'class-validator';

export class CreateAttestationDto {
  @IsNotEmpty()
  employeeId!: number;
  reason?: string;
}
