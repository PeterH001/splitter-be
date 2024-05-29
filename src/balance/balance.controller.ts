import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { GroupGuard, JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('balance')
export class BalanceController {
    constructor(private balanceServise: BalanceService){}

    @UseGuards(GroupGuard) 
    @Get(':id')
    getMyBalancesByGroup(@Param('id') groupId: string, @GetUser() user: User){
        return this.balanceServise.getMyBalancesByGroup(+groupId, user.id);
    }
    
    @UseGuards(GroupGuard) 
    @Get('yourgroupbalance/:id')
    yourGroupBalance(@Param('id') groupId: string, @GetUser() user: User){
        return this.balanceServise.yourGroupBalance(+groupId, user.id);
    }

}
