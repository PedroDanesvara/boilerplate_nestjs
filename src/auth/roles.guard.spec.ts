import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from './dto/signup.dto';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (user: any) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => {},
      getClass: () => {},
    };
    return mockContext as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir acesso quando não há roles requeridas', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({});

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir acesso para admin em qualquer rota', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({
      role: Role.ADMIN,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir acesso quando usuário tem o cargo requerido em alguma empresa', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({
      role: Role.USER,
      empresas: [
        { cargo: 'ADMIN' },
        { cargo: 'USER' },
      ],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve negar acesso quando usuário não tem o cargo requerido', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({
      role: Role.USER,
      empresas: [
        { cargo: 'USER' },
      ],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve negar acesso quando usuário não tem empresas vinculadas', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({
      role: Role.USER,
      empresas: [],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve negar acesso quando usuário não tem role definida', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({
      empresas: [],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
}); 