import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = <T>(data?: T, message: string = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, error?: string): ApiResponse => ({
  success: false,
  message,
  error,
});

export class ResponseHelper {
  public static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }

  public static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number,
    statusCode: number = 200
  ): Response<ApiResponse<T[]>> {
    const totalPages = Math.ceil(total / limit);

    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  public static created<T>(
    res: Response,
    message: string,
    data?: T
  ): Response<ApiResponse<T>> {
    return this.success(res, message, data, 201);
  }

  public static noContent(res: Response): Response {
    return res.status(204).send();
  }
}