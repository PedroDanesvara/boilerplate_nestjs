import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // Super usuário global
    if (user.role === 'ADMIN') {
      return true;
    }
    // Usuário comum: checa se tem o cargo necessário em alguma empresa
    const hasRole = user.empresas?.some((e: any) => requiredRoles.includes(e.cargo));
    if (!hasRole) {
      throw new ForbiddenException('Acesso negado: permissão insuficiente.');
    }
    return true;
  }
} 