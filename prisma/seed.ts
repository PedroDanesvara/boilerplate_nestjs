import { PrismaClient } from '@prisma/client';
import { Role, CargoEmpresa } from '../src/auth/dto/signup.dto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpa o banco (ordem importa por causa dos relacionamentos)
  await prisma.auditLog.deleteMany({});
  await prisma.empresaUsuario.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});

  // Empresas
  const empresa1 = await prisma.company.create({
    data: {
      nome: 'Empresa Alpha',
      cnpj: '12345678000199',
      endereco: 'Rua das Flores, 123',
      telefone: '(11)91234-5678',
    },
  });
  const empresa2 = await prisma.company.create({
    data: {
      nome: 'Empresa Beta',
      cnpj: '98765432000188',
      endereco: 'Av. Central, 456',
      telefone: '(21)99876-5432',
    },
  });

  // Usuários
  const admin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: await bcrypt.hash('admin123', 10),
      nome: 'Admin Global',
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@empresa.com',
      password: await bcrypt.hash('user123', 10),
      nome: 'Usuário 1',
      role: Role.USER,
      empresas: {
        create: {
          empresa_id: empresa1.id,
          cargo: CargoEmpresa.ADMIN,
        },
      },
    },
    include: { empresas: true },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@empresa.com',
      password: await bcrypt.hash('user456', 10),
      nome: 'Usuário 2',
      role: Role.USER,
      empresas: {
        create: {
          empresa_id: empresa2.id,
          cargo: CargoEmpresa.USER,
        },
      },
    },
    include: { empresas: true },
  });

  // Produtos
  const produto1 = await prisma.product.create({
    data: {
      nome: 'Produto Alpha',
      descricao: 'Produto de exemplo da Empresa Alpha',
      preco: 100.00,
      empresa_id: empresa1.id,
    },
  });
  const produto2 = await prisma.product.create({
    data: {
      nome: 'Produto Beta',
      descricao: 'Produto de exemplo da Empresa Beta',
      preco: 200.00,
      empresa_id: empresa2.id,
    },
  });

  // EmpresaUsuario (relacionamento extra)
  await prisma.empresaUsuario.create({
    data: {
      user_id: user1.id,
      empresa_id: empresa2.id,
      cargo: CargoEmpresa.USER,
    },
  });

  // AuditLog
  await prisma.auditLog.createMany({
    data: [
      {
        user_id: admin.id,
        acao: 'CREATE',
        entidade: 'Company',
        entidade_id: empresa1.id,
        detalhes: 'Empresa Alpha criada',
      },
      {
        user_id: user1.id,
        acao: 'CREATE',
        entidade: 'Product',
        entidade_id: produto1.id,
        detalhes: 'Produto Alpha criado',
      },
      {
        user_id: user2.id,
        acao: 'CREATE',
        entidade: 'Product',
        entidade_id: produto2.id,
        detalhes: 'Produto Beta criado',
      },
    ],
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 