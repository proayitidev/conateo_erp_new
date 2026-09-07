import { BadRequestException } from '@nestjs/common';

export const successWrapper = <T>(
  statusCode: number,
  message: string,
  data: T,
  total?: number,
  total_filtered?: number,
) => {
  return {
    statusCode,
    message: message.length > 0 ? message : undefined,
    data,
    total,
    total_filtered,
  };
};

export const badRequestError = (message: string) => {
  throw new BadRequestException([message]);
};
