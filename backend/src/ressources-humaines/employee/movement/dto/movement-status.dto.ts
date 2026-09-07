import { IsBoolean, IsNotEmpty } from 'class-validator';

export class MomevementStatusDTO {
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;
}
