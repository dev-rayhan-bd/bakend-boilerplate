import { Response } from 'express';

export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
  data?: T;
}

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || 'Operation successful',
    meta: data.meta,
    data: data.data,
  };

  res.status(data.statusCode).json(responseData);
};
