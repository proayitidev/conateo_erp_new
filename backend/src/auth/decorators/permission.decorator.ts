import { SetMetadata } from '@nestjs/common';
import { PermissionDecoratorValidatorDTO } from '../dto/permission.dto.js';

export const PERMISSION_KEY = 'Permission';
export const PermissionsCheck = (
  permissions: PermissionDecoratorValidatorDTO,
) => SetMetadata(PERMISSION_KEY, permissions);
