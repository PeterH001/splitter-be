import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === 'admin') {
      return true;
    }

    const groupId = request.params.id;
    console.log(groupId);

    const userGroups = (
      await this.prismaService.group.findMany({
        where: { members: { some: { id: user.id } } },
      })
    ).map((group) => group.id.toString());
    console.log('userGroups', userGroups);

    if (userGroups.includes(groupId)) {
      return true;
    }

    throw new ForbiddenException("You can't access this resource");
  }
}
