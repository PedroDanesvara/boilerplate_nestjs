import { ApiTags, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Body, Controller, Post, Get, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Produtos')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateProductDto, examples: { exemplo: { value: { nome: 'Produto Exemplo', descricao: 'Descrição do produto', preco: 99.90, empresa_id: 'uuid-da-empresa' }}}})
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de validação', schema: { example: { statusCode: 400, message: ['O nome é obrigatório.'], error: 'Validation Error', timestamp: '2025-06-06T14:00:00.000Z', path: '/product' }}})
  @ApiResponse({ status: 500, description: 'Erro interno do servidor', schema: { example: { statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error', timestamp: '2025-06-06T14:00:00.000Z', path: '/product' }}})
  @ApiResponse({ status: 409, description: 'Erro de unicidade', schema: { example: { statusCode: 409, message: 'Já existe um registro com esse valor único.', error: 'Conflict', timestamp: '2025-06-06T14:00:00.000Z', path: '/product' }}})
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productService.create(createProductDto, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({ status: 200, description: 'Lista todos os produtos.' })
  async findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Retorna o produto pelo ID.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado', schema: { example: { statusCode: 404, message: 'Registro não encontrado.', error: 'Not Found', timestamp: '2025-06-06T14:00:00.000Z', path: '/product/uuid-inexistente' }}})
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productService.update(id, updateProductDto, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.productService.remove(id, req);
  }
}
