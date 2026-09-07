import { $Enums } from '../../../utils/prisma/client.js';
import { IsEnum, IsInt, IsJSON, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserLogDto {
  @IsEnum($Enums.LogType)
  @IsNotEmpty()
  type: $Enums.LogType;

  @IsEnum($Enums.LogAction)
  @IsNotEmpty()
  logAction: $Enums.LogAction;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsJSON()
  logInfo?: Record<string, any>;
}
