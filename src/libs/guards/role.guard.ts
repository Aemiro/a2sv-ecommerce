import { CanActivate, ExecutionContext, Type } from '@nestjs/common';

export function RoleGuard(roles: string): Type<CanActivate> {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const requiredRoles = roles.split('|');
      if (requiredRoles.length < 1) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user: any = request.user;
      if (user && user.roles) {
        const userRoles = user.roles;
        return requiredRoles.some(
          (requiredRole) =>
            userRoles.includes(requiredRole.trim()) ||
            userRoles.includes('super_admin'),
        );
      }
      return false;
    }
  }

  return RoleGuardMixin;
}
