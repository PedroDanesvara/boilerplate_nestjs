import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { PrismaService } from '../prisma.service';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let prisma: PrismaService;

  const mockPrismaService = {
    auditLog: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockLogs = [
      {
        id: '1',
        user_id: 'user1',
        acao: 'CREATE',
        entidade: 'Company',
        entidade_id: 'company1',
        detalhes: 'Criação de empresa',
        criado_em: new Date(),
        user: {
          email: 'user1@test.com',
          nome: 'User 1',
        },
      },
      {
        id: '2',
        user_id: 'user2',
        acao: 'UPDATE',
        entidade: 'Product',
        entidade_id: 'product1',
        detalhes: 'Atualização de produto',
        criado_em: new Date(),
        user: {
          email: 'user2@test.com',
          nome: 'User 2',
        },
      },
    ];

    it('deve retornar todos os logs quando não há filtros', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await controller.findAll();

      expect(result).toEqual(mockLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          user_id: undefined,
          acao: undefined,
          entidade: undefined,
        },
        orderBy: { criado_em: 'desc' },
        include: { user: { select: { email: true, nome: true } } },
      });
    });

    it('deve filtrar logs por usuário', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockLogs[0]]);

      const result = await controller.findAll('user1');

      expect(result).toEqual([mockLogs[0]]);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user1',
          acao: undefined,
          entidade: undefined,
        },
        orderBy: { criado_em: 'desc' },
        include: { user: { select: { email: true, nome: true } } },
      });
    });

    it('deve filtrar logs por ação', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockLogs[0]]);

      const result = await controller.findAll(undefined, 'CREATE');

      expect(result).toEqual([mockLogs[0]]);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          user_id: undefined,
          acao: 'CREATE',
          entidade: undefined,
        },
        orderBy: { criado_em: 'desc' },
        include: { user: { select: { email: true, nome: true } } },
      });
    });

    it('deve filtrar logs por entidade', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockLogs[0]]);

      const result = await controller.findAll(undefined, undefined, 'Company');

      expect(result).toEqual([mockLogs[0]]);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          user_id: undefined,
          acao: undefined,
          entidade: 'Company',
        },
        orderBy: { criado_em: 'desc' },
        include: { user: { select: { email: true, nome: true } } },
      });
    });

    it('deve aplicar múltiplos filtros', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockLogs[0]]);

      const result = await controller.findAll('user1', 'CREATE', 'Company');

      expect(result).toEqual([mockLogs[0]]);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user1',
          acao: 'CREATE',
          entidade: 'Company',
        },
        orderBy: { criado_em: 'desc' },
        include: { user: { select: { email: true, nome: true } } },
      });
    });
  });
}); 