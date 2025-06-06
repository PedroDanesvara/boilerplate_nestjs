import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Empresa Exemplo', description: 'Nome da empresa' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString()
  nome: string;

  @ApiProperty({ example: '12345678000199', description: 'CNPJ da empresa (14 dígitos)' })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório.' })
  @IsString()
  @Matches(/^\d{14}$/,{ message: 'CNPJ deve conter 14 dígitos numéricos.' })
  cnpj: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123', description: 'Endereço da empresa' })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({ example: '(11)91234-5678', description: 'Telefone da empresa' })
  @IsOptional()
  @IsString()
  @Matches(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/,{ message: 'Telefone em formato inválido.' })
  telefone?: string;
} 