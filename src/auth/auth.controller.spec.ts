import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../auth/dto/signup.dto';
import { CargoEmpresa } from '../auth/dto/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const adminData = {
      email: 'admin@test.com',
      password: 'Admin@123',
      nome: 'Admin Test',
      role: Role.ADMIN,
    };

    const userData = {
      email: 'user@test.com',
      password: 'User@123',
      nome: 'User Test',
      role: Role.USER,
      empresa_id: '123',
      cargo: CargoEmpresa.ADMIN,
    };

    it('deve cadastrar um usuário admin', async () => {
      const expectedResponse = {
        id: '1',
        email: adminData.email,
        nome: adminData.nome,
        role: Role.ADMIN,
        criado_em: new Date(),
      };

      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(adminData);

      expect(result).toEqual(expectedResponse);
      expect(authService.signup).toHaveBeenCalledWith(adminData);
    });

    it('deve cadastrar um usuário comum', async () => {
      const expectedResponse = {
        id: '2',
        email: userData.email,
        nome: userData.nome,
        role: Role.USER,
        empresas: [{
          empresa_id: userData.empresa_id,
          cargo: userData.cargo,
        }],
        criado_em: new Date(),
      };

      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(userData);

      expect(result).toEqual(expectedResponse);
      expect(authService.signup).toHaveBeenCalledWith(userData);
    });
  });

  describe('signin', () => {
    const signinData = {
      email: 'user@test.com',
      password: 'User@123',
    };

    it('deve fazer login com sucesso', async () => {
      const expectedResponse = {
        access_token: 'jwt_token',
        user: {
          id: '1',
          email: signinData.email,
          nome: 'User Test',
          role: Role.USER,
          empresas: [{
            empresa_id: '123',
            cargo: CargoEmpresa.ADMIN,
            empresa_nome: 'Empresa Test',
          }],
        },
      };

      mockAuthService.signin.mockResolvedValue(expectedResponse);

      const result = await controller.signin(signinData);

      expect(result).toEqual(expectedResponse);
      expect(authService.signin).toHaveBeenCalledWith(signinData);
    });
  });
});
