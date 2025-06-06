import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role, CargoEmpresa } from './dto/signup.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  hashSync: jest.fn(),
  compareSync: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockReset();
  });

  describe('signup', () => {
    it('deve criar um usuário admin', async () => {
      const adminData = {
        email: 'admin@test.com',
        password: '123456',
        nome: 'Admin Test',
        role: Role.ADMIN,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: adminData.email,
        nome: adminData.nome,
        role: Role.ADMIN,
        criado_em: new Date(),
      });

      const result = await service.signup(adminData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(adminData.email);
      expect(result.role).toBe(Role.ADMIN);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: adminData.email,
          nome: adminData.nome,
          role: Role.ADMIN,
        }),
        select: expect.any(Object),
      });
    });

    it('deve criar um usuário comum com empresa', async () => {
      const userData = {
        email: 'user@test.com',
        password: '123456',
        nome: 'User Test',
        role: Role.USER,
        empresa_id: '1',
        cargo: CargoEmpresa.USER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '2',
        email: userData.email,
        nome: userData.nome,
        role: Role.USER,
        empresas: [{
          empresa_id: userData.empresa_id,
          cargo: userData.cargo,
        }],
        criado_em: new Date(),
      });

      const result = await service.signup(userData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(Role.USER);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: userData.email,
          nome: userData.nome,
          role: Role.USER,
          empresas: {
            create: {
              empresa_id: userData.empresa_id,
              cargo: userData.cargo,
            },
          },
        }),
        select: expect.any(Object),
      });
    });

    it('deve lançar erro se email já existir', async () => {
      const adminData = {
        email: 'admin@test.com',
        password: '123456',
        nome: 'Admin Test',
        role: Role.ADMIN,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: adminData.email,
      });

      await expect(service.signup(adminData)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se usuário comum não informar empresa e cargo', async () => {
      const invalidUserData = {
        email: 'user@test.com',
        password: '123456',
        nome: 'User Test',
        role: Role.USER,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.signup(invalidUserData)).rejects.toThrow('Usuário comum deve informar empresa_id e cargo.');
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    const signinData = {
      email: 'user@test.com',
      password: 'User@123',
    };

    const mockUser = {
      id: '1',
      email: signinData.email,
      password: 'hashed_password',
      nome: 'User Test',
      role: Role.USER,
      empresas: [{
        empresa_id: '123',
        cargo: 'ADMIN',
        empresa: {
          nome: 'Empresa Test',
        },
      }],
    };

    it('deve fazer login com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt_token');
      const result = await service.signin(signinData);
      expect(result).toHaveProperty('access_token', 'jwt_token');
      expect(result.user).toHaveProperty('email', signinData.email);
      expect(result.user).toHaveProperty('role', Role.USER);
      expect(result.user.empresas).toHaveLength(1);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      }));
    });

    it('não deve permitir login com email inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.signin(signinData)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('não deve permitir login com senha incorreta', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(signinData)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
