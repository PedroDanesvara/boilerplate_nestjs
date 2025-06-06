import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              create: jest.fn().mockResolvedValue({
                id: 'uuid',
                nome: 'Empresa Para Teste',
                cnpj: '12345678000199',
                endereco: 'Rua Teste',
                telefone: '(11)91234-5678',
                criada_em: new Date(),
                produtos: [],
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma empresa', async () => {
    const data = {
      nome: 'Empresa Para Teste',
      cnpj: '12345678000199',
      endereco: 'Rua Teste',
      telefone: '(11)91234-5678',
    };
    const result = await service.create(data);
    expect(result).toHaveProperty('id');
    expect(prisma.company.create).toHaveBeenCalledWith({ data });
  });
});
