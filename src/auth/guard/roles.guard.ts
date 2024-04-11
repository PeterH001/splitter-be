import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    console.log("roles: ", roles);
    
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if(matchRoles(roles, user.role)){
      return true;
    }

    throw new ForbiddenException("You can't access this resource");
  }
}

function matchRoles(roles: string[], userRole: any): boolean {
  return roles.includes(userRole);
}
