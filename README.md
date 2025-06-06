# Boilerplate NestJS - Empresas e Produtos

## Introdução
Este projeto é um CRUD completo de empresas e produtos utilizando Nest.js, Prisma ORM e PostgreSQL, com validações, testes automatizados, documentação e práticas modernas de segurança.

## Segurança
O projeto já vem configurado com as principais práticas de segurança para APIs modernas:

- **Helmet**: Adiciona diversos headers HTTP de proteção automaticamente, prevenindo ataques como XSS, clickjacking e exposição de informações sensíveis.
- **CORS**: Habilitado e configurado para permitir requisições apenas de domínios autorizados (por padrão, `http://localhost:4200`).
- **Rate Limiting**: Limita cada IP a 20 requisições por minuto, protegendo contra ataques de força bruta e abuso de API.

Essas proteções são aplicadas globalmente e podem ser ajustadas nos arquivos `main.ts` e `app.module.ts`.

## Script de Seed (Popular o Banco com Dados de Exemplo)

Para facilitar o desenvolvimento e testes, o projeto inclui um script de seed que popula o banco com dados de exemplo para **todas as entidades** (empresas, produtos, usuários, vínculos, logs de auditoria).

### Como rodar o seed:

1. Certifique-se de ter rodado as migrations:
   ```sh
   npx prisma migrate dev
   ```
2. Execute o seed:
   ```sh
   npm run seed
   ```
   > O comando irá limpar o banco e inserir dados de exemplo automaticamente.

### O que é criado no seed:
- **Empresas:**
  - Empresa Alpha (CNPJ: 12345678000199)
  - Empresa Beta (CNPJ: 98765432000188)
- **Usuários:**
  - admin@admin.com (senha: admin123, ADMIN global)
  - user1@empresa.com (senha: user123, ADMIN da Empresa Alpha)
  - user2@empresa.com (senha: user456, USER da Empresa Beta)
- **Produtos:**
  - Produto Alpha (Empresa Alpha)
  - Produto Beta (Empresa Beta)
- **Vínculos Empresa/Usuário:**
  - user1 também é USER na Empresa Beta
- **Logs de Auditoria:**
  - Criação de empresas e produtos por cada usuário

> **Obs:** O script de seed pode ser ajustado em `prisma/seed.ts` para criar mais dados ou cenários específicos.

## Pré-requisitos
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (recomendado v18+)

## Configuração do Ambiente
1. Clone o repositório:
   ```sh
   git clone https://github.com/PedroDanesvara/boilerplate_nestjs.git
   cd boilerplate_nestjs
   ```
2. Copie o arquivo de variáveis de ambiente:
   ```sh
   cp env.example .env
   ```
   Ajuste as variáveis se necessário.

## Subindo o ambiente com Docker
1. Execute:
   ```sh
   docker-compose up -d
   ```
2. O banco de dados estará disponível em `localhost:5432` e o pgAdmin em `localhost:5050`.

## Instalação das dependências
```sh
npm install
```

## Migrations e Prisma
1. Gere o Prisma Client:
   ```sh
   npx prisma generate
   ```
2. Rode as migrations para criar as tabelas:
   ```sh
   npx prisma migrate dev --name init
   ```

## Execução da aplicação
```sh
npm run start:dev
```
A API estará disponível em `http://localhost:3000`.

## Testes
Execute todos os testes automatizados com:
```sh
npm run test
```

## Estrutura do Projeto
```
├── src
│   ├── company/         # Módulo de empresas
│   ├── product/         # Módulo de produtos
│   ├── prisma.service.ts# Provider do Prisma
│   └── ...
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── env.example          # Exemplo de variáveis de ambiente
├── docker-compose.yml   # Orquestração dos containers
└── README.md            # Documentação
```

## Endpoints da API
### Empresas
- **Criar empresa**
  - `POST /company`
  - Body:
    ```json
    {
      "nome": "Empresa Exemplo",
      "cnpj": "12345678000199",
      "endereco": "Rua das Flores, 123",
      "telefone": "(11)91234-5678"
    }
    ```
- **Listar empresas**
  - `GET /company`
- **Buscar empresa por ID**
  - `GET /company/{id}`
- **Atualizar empresa**
  - `PATCH /company/{id}`
  - Body: (qualquer campo pode ser enviado)
    ```json
    {
      "nome": "Novo Nome"
    }
    ```
- **Remover empresa**
  - `DELETE /company/{id}`
- **Listar produtos de uma empresa**
  - `GET /company/{id}/products`

### Produtos
- **Criar produto**
  - `POST /product`
  - Body:
    ```json
    {
      "nome": "Produto Exemplo",
      "descricao": "Descrição do produto",
      "preco": 99.90,
      "empresa_id": "<id-da-empresa>"
    }
    ```
- **Listar produtos**
  - `GET /product`
- **Buscar produto por ID**
  - `GET /product/{id}`
- **Atualizar produto**
  - `PATCH /product/{id}`
  - Body: (qualquer campo pode ser enviado)
    ```json
    {
      "preco": 120.00
    }
    ```
- **Remover produto**
  - `DELETE /product/{id}`

## Observações
- O sistema valida CNPJ, telefone e unicidade de campos no banco.
- Testes automatizados cobrem services e controllers.
- O pgAdmin pode ser acessado em `http://localhost:5050` (login: admin@admin.com / admin).

## Documentação Swagger/OpenAPI
A documentação interativa da API está disponível via Swagger em:

```
http://localhost:3000/api-docs
```

Nela você pode visualizar todos os endpoints, schemas, exemplos e até realizar requisições de teste diretamente pelo navegador.

## Padrão de resposta de erro da API
Todas as respostas de erro seguem o padrão:

```json
{
  "statusCode": 400,
  "message": "Mensagem descritiva do erro ou array de mensagens",
  "error": "Tipo do erro (ex: Bad Request, Conflict, Not Found)",
  "timestamp": "2025-06-06T14:00:00.000Z",
  "path": "/rota"
}
```

Exemplo de erro de validação:
```json
{
  "statusCode": 400,
  "message": [
    "O nome é obrigatório.",
    "CNPJ deve conter 14 dígitos numéricos."
  ],
  "error": "Validation Error",
  "timestamp": "2025-06-06T14:00:00.000Z",
  "path": "/company"
}
```

Exemplo de erro de unicidade:
```json
{
  "statusCode": 409,
  "message": "Já existe um registro com esse valor único.",
  "error": "Conflict",
  "timestamp": "2025-06-06T14:00:00.000Z",
  "path": "/company"
}
```

Exemplo de erro de registro não encontrado:
```json
{
  "statusCode": 404,
  "message": "Registro não encontrado.",
  "error": "Not Found",
  "timestamp": "2025-06-06T14:00:00.000Z",
  "path": "/company/uuid-inexistente"
}
```

## Autenticação e uso do JWT
A API utiliza autenticação JWT para proteger endpoints sensíveis.

### Como obter o token
1. Faça login via:
   ```http
   POST /auth/signin
   {
     "email": "seu@email.com",
     "password": "suaSenha"
   }
   ```
2. A resposta será:
   ```json
   {
     "access_token": "SEU_TOKEN_AQUI",
     "user": { ... }
   }
   ```

### Como usar o token
Inclua o token no header `Authorization` das requisições protegidas:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

Exemplo com curl:
```sh
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:3000/product
```

No Swagger, clique em "Authorize" e cole o token no campo.

### Permissões
- Apenas super usuários (`role: ADMIN`) podem acessar endpoints administrativos e listagem geral de produtos/logs.
- Usuários comuns só podem acessar recursos vinculados à empresa e conforme seu cargo.

## Logs de Auditoria
- Todas as ações sensíveis (criação, edição, remoção) de empresas e produtos são registradas.
- Endpoint para consulta:
  - `GET /audit-log` (apenas super usuários)
  - Filtros: `user_id`, `acao`, `entidade`

---
