import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { Role } from '../src/auth/dto/signup.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Limpa o banco antes dos testes
    await prisma.auditLog.deleteMany();
    await prisma.empresaUsuario.deleteMany();
    await prisma.product.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Autenticação', () => {
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
    };

    describe('Cadastro de usuários', () => {
      it('deve cadastrar um usuário admin', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(adminData)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe(adminData.email);
            expect(res.body.role).toBe(Role.ADMIN);
          });
      });

      it('deve cadastrar um usuário comum', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(userData)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe(userData.email);
            expect(res.body.role).toBe(Role.USER);
          });
      });

      it('não deve permitir cadastro com email duplicado', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(adminData)
          .expect(409)
          .expect((res) => {
            expect(res.body.message).toBe('E-mail já cadastrado.');
          });
      });

      it('não deve permitir cadastro com dados inválidos', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'invalid-email',
            password: '123',
            nome: '',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('email must be an email');
            expect(res.body.message).toContain('password is not strong enough');
            expect(res.body.message).toContain('nome should not be empty');
          });
      });
    });

    describe('Login de usuários', () => {
      it('deve fazer login com admin', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: adminData.email,
            password: adminData.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user.email).toBe(adminData.email);
        expect(response.body.user.role).toBe(Role.ADMIN);
        adminToken = response.body.access_token;
      });

      it('deve fazer login com usuário comum', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: userData.email,
            password: userData.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.role).toBe(Role.USER);
        userToken = response.body.access_token;
      });

      it('não deve permitir login com credenciais inválidas', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: adminData.email,
            password: 'wrong-password',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBe('E-mail ou senha inválidos.');
          });
      });

      it('não deve permitir login com email inexistente', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: 'nonexistent@test.com',
            password: 'any-password',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBe('E-mail ou senha inválidos.');
          });
      });
    });
  });

  describe('Empresas', () => {
    const companyData = {
      nome: 'Empresa Test',
      cnpj: '12345678000199',
      endereco: 'Rua Test, 123',
      telefone: '(11)91234-5678',
    };

    let companyId: string;

    it('não deve permitir criar empresa sem autenticação', () => {
      return request(app.getHttpServer())
        .post('/company')
        .send(companyData)
        .expect(401);
    });

    it('não deve permitir criar empresa com usuário comum', () => {
      return request(app.getHttpServer())
        .post('/company')
        .set('Authorization', `Bearer ${userToken}`)
        .send(companyData)
        .expect(403);
    });

    it('deve criar empresa com admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/company')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(companyData.nome);
      expect(response.body.cnpj).toBe(companyData.cnpj);
      companyId = response.body.id;
    });

    it('não deve permitir criar empresa com CNPJ duplicado', () => {
      return request(app.getHttpServer())
        .post('/company')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData)
        .expect(409);
    });

    it('deve listar empresas', async () => {
      const response = await request(app.getHttpServer())
        .get('/company')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('nome');
    });

    it('deve buscar empresa por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/company/${companyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(companyId);
      expect(response.body.nome).toBe(companyData.nome);
    });

    it('deve atualizar empresa', async () => {
      const updateData = {
        nome: 'Empresa Test Atualizada',
      };

      const response = await request(app.getHttpServer())
        .patch(`/company/${companyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nome).toBe(updateData.nome);
    });

    it('deve remover empresa', () => {
      return request(app.getHttpServer())
        .delete(`/company/${companyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Produtos', () => {
    const productData = {
      nome: 'Produto Test',
      descricao: 'Descrição do produto teste',
      preco: 99.90,
      empresa_id: '',
    };

    let productId: string;

    beforeAll(async () => {
      // Cria uma empresa para os testes
      const companyResponse = await request(app.getHttpServer())
        .post('/company')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Empresa para Produtos',
          cnpj: '98765432000199',
          endereco: 'Rua Produtos, 123',
          telefone: '(11)98765-4321',
        });

      productData.empresa_id = companyResponse.body.id;
    });

    it('não deve permitir criar produto sem autenticação', () => {
      return request(app.getHttpServer())
        .post('/product')
        .send(productData)
        .expect(401);
    });

    it('não deve permitir criar produto com usuário comum', () => {
      return request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(403);
    });

    it('deve criar produto com admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(productData.nome);
      expect(response.body.preco).toBe(productData.preco);
      productId = response.body.id;
    });

    it('não deve permitir criar produto com dados inválidos', () => {
      return request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: '',
          preco: -10,
        })
        .expect(400);
    });

    it('deve listar produtos', async () => {
      const response = await request(app.getHttpServer())
        .get('/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('nome');
    });

    it('deve buscar produto por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/product/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.nome).toBe(productData.nome);
    });

    it('deve atualizar produto', async () => {
      const updateData = {
        nome: 'Produto Test Atualizado',
        preco: 149.90,
      };

      const response = await request(app.getHttpServer())
        .patch(`/product/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nome).toBe(updateData.nome);
      expect(response.body.preco).toBe(updateData.preco);
    });

    it('deve remover produto', () => {
      return request(app.getHttpServer())
        .delete(`/product/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Logs de Auditoria', () => {
    it('não deve permitir acessar logs sem autenticação', () => {
      return request(app.getHttpServer())
        .get('/audit-log')
        .expect(401);
    });

    it('não deve permitir acessar logs com usuário comum', () => {
      return request(app.getHttpServer())
        .get('/audit-log')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('deve listar logs com admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-log')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve filtrar logs por usuário', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-log')
        .query({ user_id: 'user1' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve filtrar logs por ação', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-log')
        .query({ acao: 'CREATE' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve filtrar logs por entidade', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-log')
        .query({ entidade: 'Company' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
