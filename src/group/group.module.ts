import { Module, forwardRef } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { BalanceModule } from 'src/balance/balance.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports:[forwardRef(() => BalanceModule), PaymentModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports:[GroupService]
})
export class GroupModule {}
