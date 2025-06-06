import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Empresa Atualizada', description: 'Nome da empresa' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: '12345678000199', description: 'CNPJ da empresa (14 dígitos)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/,{ message: 'CNPJ deve conter 14 dígitos numéricos.' })
  cnpj?: string;

  @ApiPropertyOptional({ example: 'Rua Nova, 456', description: 'Endereço da empresa' })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({ example: '(11)91234-5678', description: 'Telefone da empresa' })
  @IsOptional()
  @IsString()
  @Matches(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/,{ message: 'Telefone em formato inválido.' })
  telefone?: string;
} 