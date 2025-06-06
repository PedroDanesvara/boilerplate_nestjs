import { ApiTags, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Body, Controller, Post, Get, Param, Patch, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Empresas')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateCompanyDto, examples: { exemplo: { value: { nome: 'Empresa Exemplo', cnpj: '12345678000199', endereco: 'Rua das Flores, 123', telefone: '(11)91234-5678' }}}})
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de validação', schema: { example: { statusCode: 400, message: ['O nome é obrigatório.'], error: 'Validation Error', timestamp: '2025-06-06T14:00:00.000Z', path: '/company' }}})
  @ApiResponse({ status: 409, description: 'Erro de unicidade', schema: { example: { statusCode: 409, message: 'Já existe um registro com esse valor único.', error: 'Conflict', timestamp: '2025-06-06T14:00:00.000Z', path: '/company' }}})
  @ApiResponse({ status: 500, description: 'Erro interno do servidor', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error', timestamp: '2025-06-06T14:00:00.000Z', path: '/company' }}})
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companyService.create(createCompanyDto, req);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Lista todas as empresas.' })
  async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Retorna a empresa pelo ID.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado', schema: { example: { statusCode: 404, message: 'Registro não encontrado.', error: 'Not Found', timestamp: '2025-06-06T14:00:00.000Z', path: '/company/uuid-inexistente' }}})
  async findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiParam({ name: 'id', description: 'ID da empresa' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada.' })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req) {
    return this.companyService.update(id, updateCompanyDto, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiParam({ name: 'id', description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Empresa removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada.' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.companyService.remove(id, req);
  }

  @Get(':id/products')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Lista os produtos da empresa.' })
  async findProducts(@Param('id') id: string, @Request() req) {
    const user = req.user;
    if (user.role === 'ADMIN') {
      return this.companyService.findProducts(id);
    }
    const vinculado = user.empresas?.some((e: any) => e.empresa_id === id);
    if (!vinculado) {
      throw new ForbiddenException('Acesso negado: você não está vinculado a esta empresa.');
    }
    return this.companyService.findProducts(id);
  }
}
