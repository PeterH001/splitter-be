import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { ExpenseModule } from './expense/expense.module';
import { DebtModule } from './debt/debt.module';
import { BalanceModule } from './balance/balance.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GroupModule,
    ExpenseModule,
    DebtModule,
    BalanceModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
