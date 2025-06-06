import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Produto Atualizado', description: 'Nome do produto' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 'Nova descrição', description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 120.00, description: 'Preço do produto' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número.' })
  @Min(0, { message: 'O preço deve ser maior ou igual a zero.' })
  preco?: number;

  @ApiPropertyOptional({ example: 'uuid-da-empresa', description: 'ID da empresa vinculada' })
  @IsOptional()
  @IsString()
  empresa_id?: string;
} 