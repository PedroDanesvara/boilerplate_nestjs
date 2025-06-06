import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos CRUD serão implementados aqui

  async create(data: { nome: string; descricao?: string; preco: number; empresa_id: string }, req?: Request) {
    const produto = await this.prisma.product.create({ data });
    if (req?.user) {
      await this.prisma.auditLog.create({
        data: {
          user_id: (req.user as any).sub,
          acao: 'CREATE',
          entidade: 'Product',
          entidade_id: produto.id,
          detalhes: JSON.stringify(data),
        },
      });
    }
    return produto;
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<{ nome: string; descricao?: string; preco?: number; empresa_id?: string }>, req?: Request) {
    const produto = await this.prisma.product.update({ where: { id }, data });
    if (req?.user) {
      await this.prisma.auditLog.create({
        data: {
          user_id: (req.user as any).sub,
          acao: 'UPDATE',
          entidade: 'Product',
          entidade_id: id,
          detalhes: JSON.stringify(data),
        },
      });
    }
    return produto;
  }

  async remove(id: string, req?: Request) {
    const produto = await this.prisma.product.delete({ where: { id } });
    if (req?.user) {
      await this.prisma.auditLog.create({
        data: {
          user_id: (req.user as any).sub,
          acao: 'DELETE',
          entidade: 'Product',
          entidade_id: id,
          detalhes: JSON.stringify(produto),
        },
      });
    }
    return produto;
  }
}
