import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { BalanceModule } from 'src/balance/balance.module';

@Module({
  imports:[BalanceModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports:[GroupService]
})
export class GroupModule {}
