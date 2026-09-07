import { SetMetadata } from '@nestjs/common';

export const JWTKey = 'IsRequired';
export const JWTKeyCheck = (isRequired: boolean = true) =>
  SetMetadata(JWTKey, isRequired);
