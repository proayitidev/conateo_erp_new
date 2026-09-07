import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator.js';
import {
  PrivilegeDecoratorDTO,
  PermissionDecoratorValidatorDTO,
} from '../dto/permission.dto.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const dataModule =
      this.reflector.getAllAndOverride<PermissionDecoratorValidatorDTO>(
        PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );
    const { privilege, or, and } = dataModule;
    if (!privilege && (!and || and.length == 0) && (!or || or.length == 0)) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const { rolePrivs } = user.role;

    if (rolePrivs.length == 0) {
      return false;
    }
    if (privilege) {
      return (rolePrivs as Array<any>).some((rolePriv: any) => {
        return checkIfhasPermission(privilege, rolePriv);
      });
    } else if (and) {
      return and.every((el) => {
        const modulePriv = rolePrivs.find(
          ({ permission }) => permission.code == el.code,
        );
        if (!modulePriv) return false;
        return checkIfhasPermission(el, modulePriv);
      });
    } else if (or) {
      return or.some((el) => {
        const rolePriv = rolePrivs.find(
          ({ privilege }) => privilege.code == el.code,
        );
        if (!rolePriv) return false;
        return checkIfhasPermission(el, rolePriv);
      });
    } else {
      return false;
    }
  }
}

function checkIfhasPermission(
  dto: PrivilegeDecoratorDTO,
  { permissions, privilege },
): boolean {
  return (
    dto.code == privilege.code &&
    dto.permissions.every((el) => permissions.includes(el))
  );
}
