import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [BalanceService],
  exports:[BalanceService],
  controllers: [BalanceController],
  imports:[UserModule]
})
export class BalanceModule {}
