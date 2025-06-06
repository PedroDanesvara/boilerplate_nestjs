import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SignupDto, Role, CargoEmpresa } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(data: SignupDto) {
    const userExists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (userExists) {
      throw new ConflictException('E-mail já cadastrado.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Se for super usuário (ADMIN global)
    if (data.role === Role.ADMIN) {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          nome: data.nome,
          role: Role.ADMIN,
        },
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          criado_em: true,
        },
      });
      return user;
    }

    // Usuário comum precisa de empresa e cargo
    if (!data.empresa_id || !data.cargo) {
      throw new BadRequestException('Usuário comum deve informar empresa_id e cargo.');
    }

    // Cria usuário comum
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nome: data.nome,
        role: Role.USER,
        empresas: {
          create: {
            empresa_id: data.empresa_id,
            cargo: data.cargo,
          },
        },
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        empresas: true,
        criado_em: true,
      },
    });
    return user;
  }

  async signin(data: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { empresas: { include: { empresa: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    // Monta payload do token
    const payload = {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      empresas: user.empresas.map(eu => ({
        empresa_id: eu.empresa_id,
        cargo: eu.cargo,
        empresa_nome: eu.empresa?.nome,
      })),
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        empresas: payload.empresas,
      },
    };
  }
}
