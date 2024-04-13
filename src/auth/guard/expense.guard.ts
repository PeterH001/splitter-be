import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpenseGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('userId: ', user.id);

    if (user.role === 'admin') {
      return true;
    }

    const expenseId = request.params.id;
    console.log('expenseId: ', expenseId);

    //olyan expensehez van hozzáférése, amelyet ő fizetett, vagy van benne tartozása
    const groupId = await this.prismaService.expense.findUnique({
      where: { id: +expenseId },
      select: { groupId: true },
    });

    const group = await this.prismaService.group.findUnique({
      where: { id: groupId.groupId },
      include: { members: { select: { id: true } } },
    });
    const groupMembers = group.members.map((member) => member.id);

    if (groupMembers.includes(user.id)) {
      return true;
    }

    throw new ForbiddenException("You can't access this resource");
  }
}
