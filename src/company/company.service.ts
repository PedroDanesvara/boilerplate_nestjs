import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos CRUD serão implementados aqui

  async create(data: { nome: string; cnpj: string; endereco?: string; telefone?: string }, req?: Request) {
    // Validação de unicidade de nome e cnpj será feita pelo banco (unique)
    const empresa = await this.prisma.company.create({ data });
    if (req?.user) {
      await this.prisma.auditLog.create({
        data: {
          // @ts-ignore
          user_id: req.user?.sub || req.user?.id,
          acao: 'CREATE',
          entidade: 'Company',
          entidade_id: empresa.id,
          detalhes: JSON.stringify(data),
        },
      });
    }
    return empresa;
  }

  async findAll() {
    return this.prisma.company.findMany();
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<{ nome: string; cnpj: string; endereco?: string; telefone?: string }>, req?: Request) {
    const empresa = await this.prisma.company.update({ where: { id }, data });
    if (req?.user) {
      await this.prisma.auditLog.create({
        data: {
          // @ts-ignore
          user_id: req.user?.sub || req.user?.id,
          acao: 'UPDATE',
          entidade: 'Company',
          entidade_id: id,
          detalhes: JSON.stringify(data),
        },
      });
    }
    return empresa;
  }

  async remove(id: string, req?: Request) {
    const empresa = await this.prisma.company.delete({ where: { id } });
    if (req?.user) {
      await this.prisma.auditLog.create({
        data: {
          // @ts-ignore
          user_id: req.user?.sub || req.user?.id,
          acao: 'DELETE',
          entidade: 'Company',
          entidade_id: id,
          detalhes: JSON.stringify(empresa),
        },
      });
    }
    return empresa;
  }

  async findProducts(id: string) {
    return this.prisma.product.findMany({ where: { empresa_id: id } });
  }
}
