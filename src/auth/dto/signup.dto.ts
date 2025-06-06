import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum CargoEmpresa {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class SignupDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nome do Usuário', description: 'Nome do usuário' })
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ enum: Role, description: 'Tipo de usuário (ADMIN = super usuário, USER = usuário comum)' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'uuid-da-empresa', description: 'ID da empresa para usuário comum' })
  @IsOptional()
  @IsString()
  empresa_id?: string;

  @ApiPropertyOptional({ enum: CargoEmpresa, description: 'Cargo do usuário na empresa (ADMIN ou USER)' })
  @IsOptional()
  @IsEnum(CargoEmpresa)
  cargo?: CargoEmpresa;
} 