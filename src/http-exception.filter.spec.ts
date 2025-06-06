import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as any;

    filter = new HttpExceptionFilter();
  });

  it('deve tratar HttpException', () => {
    const exception = new HttpException('Erro de teste', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Erro de teste',
      error: 'Bad Request',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  it('deve tratar erro de unicidade do Prisma', () => {
    const exception = new PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '4.0.0',
      meta: { target: ['email'] },
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Já existe um registro com esse valor único.',
      error: 'Conflict',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  it('deve tratar erro de registro não encontrado do Prisma', () => {
    const exception = new PrismaClientKnownRequestError('Record to delete does not exist', {
      code: 'P2025',
      clientVersion: '4.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Registro não encontrado.',
      error: 'Not Found',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  it('deve tratar erro de validação do Prisma', () => {
    const exception = new PrismaClientValidationError('Invalid input', { clientVersion: '4.0.0' });
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Erro de validação nos dados enviados.',
      error: 'Bad Request',
      path: '/test',
      timestamp: expect.any(String),
    });
  });

  it('deve tratar erro de validação do class-validator', () => {
    const exception = {
      getResponse: () => ({
        message: ['email deve ser um email válido', 'campo é obrigatório'],
      }),
      getStatus: () => HttpStatus.BAD_REQUEST,
    };

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['email deve ser um email válido', 'campo é obrigatório'],
      error: 'Bad Request',
      path: '/test',
      timestamp: expect.any(String),
    });
  });
}); 