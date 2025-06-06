import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auditoria')
@ApiBearerAuth()
@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'acao', required: false })
  @ApiQuery({ name: 'entidade', required: false })
  async findAll(
    @Query('user_id') user_id?: string,
    @Query('acao') acao?: string,
    @Query('entidade') entidade?: string,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        user_id: user_id || undefined,
        acao: acao || undefined,
        entidade: entidade || undefined,
      },
      orderBy: { criado_em: 'desc' },
      include: { user: { select: { email: true, nome: true } } },
    });
  }
} 