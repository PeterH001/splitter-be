import { Module, forwardRef } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { UserModule } from 'src/user/user.module';
import { GroupModule } from 'src/group/group.module';

@Module({
  providers: [BalanceService],
  exports:[BalanceService],
  controllers: [BalanceController],
  imports:[UserModule, forwardRef(() => GroupModule)]
})
export class BalanceModule {}
