/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { $Enums } from '../../utils/prisma/client.js';
import { get } from 'lodash-es';

export const GetUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (key) return get(request.user, key);
    return request.user;
  },
);

export const GetUserDocumentAccess = createParamDecorator(
  (
    param: { key?: string; permissions: $Enums.AccessLevel[] },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const privilege = request.user.role.rolePrivs
      .filter((val: Record<string, any>) => {
        return (
          val.privilege.code.startsWith('PRIV_DOCUMENT') &&
          (!param ||
            !param.permissions ||
            param.permissions.every((el) => val.permissions.includes(el)))
        );
      })
      .map((val: Record<string, any>) => {
        return val.privilege.code.replace('PRIV_DOCUMENT_', '');
      });
    if (param && param.key) return get(privilege, param.key);
    return privilege;
  },
);

export const GetUserorganisationAccessAccess = createParamDecorator(
  (
    param: { type: $Enums.AffectationType; key: string | undefined },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const privilege = request.user.role.rolePrivs
      .filter((val: Record<string, any>) => {
        return val.privilege.name.startWith('priv_' + param.type);
      })
      .map((val: Record<string, any>) => {
        return val.privilege.name.replace(`priv_${param.type}_`, '');
      });
    if (param.key) return get(privilege, param.key);
    return privilege;
  },
);
