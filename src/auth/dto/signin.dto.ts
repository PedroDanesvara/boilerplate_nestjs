import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha do usuário' })
  @IsNotEmpty()
  password: string;
} 