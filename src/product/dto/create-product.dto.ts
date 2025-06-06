import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Produto Exemplo', description: 'Nome do produto' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({ example: 'Descrição do produto', description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 99.90, description: 'Preço do produto' })
  @IsNotEmpty({ message: 'O preço é obrigatório.' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número.' })
  @Min(0, { message: 'O preço deve ser maior ou igual a zero.' })
  preco: number;

  @ApiProperty({ example: 'uuid-da-empresa', description: 'ID da empresa vinculada' })
  @IsNotEmpty({ message: 'O ID da empresa é obrigatório.' })
  @IsString()
  empresa_id: string;
} 