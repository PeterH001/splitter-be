import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { GroupGuard, JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('balance')
export class BalanceController {
    constructor(private balanceServise: BalanceService){}

    @UseGuards(GroupGuard) 
    @Get(':id')
    getMyBalancesByGroupId(@Param('id') groupId: string, @GetUser() user: User){
        return this.balanceServise.getMyBalancesByGroup(+groupId, user.id);
    }
}
