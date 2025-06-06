import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        if (status === 400) error = 'Bad Request';
        else if (status === 404) error = 'Not Found';
        else if (status === 409) error = 'Conflict';
        else error = 'Error';
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        error = (res as any).error || (status === 400 ? 'Bad Request' : status === 404 ? 'Not Found' : status === 409 ? 'Conflict' : error);
      }
    } else if (exception instanceof Error && exception.name === 'PrismaClientKnownRequestError') {
      if ((exception as any).code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Já existe um registro com esse valor único.';
        error = 'Conflict';
      } else if ((exception as any).code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado.';
        error = 'Not Found';
      }
    } else if (exception instanceof Error && exception.name === 'PrismaClientValidationError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Erro de validação nos dados enviados.';
      error = 'Bad Request';
    } else if (Array.isArray(exception?.response?.message) && exception?.response?.message[0] instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.response.message.map((err: ValidationError) => Object.values(err.constraints || {})).flat();
      error = 'Validation Error';
    } else if (typeof exception.getResponse === 'function' && Array.isArray(exception.getResponse()?.message) && typeof exception.getResponse().message[0] === 'string') {
      status = typeof exception.getStatus === 'function' ? exception.getStatus() : HttpStatus.BAD_REQUEST;
      message = exception.getResponse().message;
      error = 'Bad Request';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request?.url,
    });
  }
} 