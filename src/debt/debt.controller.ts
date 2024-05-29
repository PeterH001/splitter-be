import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDTO } from './dto/create-debt.dto';
import { UpdateDebtDTO } from './dto/update-debt.dto';
import { GetUser, Roles } from '../auth/decorator';
import { User } from '@prisma/client';
import { JwtGuard, RolesGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post()
  create(@Body() createDebtDto: CreateDebtDTO) {
    return this.debtService.create(createDebtDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get()
  findAll() {
    return this.debtService.findAll();
  }

  @Get('/mydebts')
  findAllByUserId(@GetUser() user: User) {
    return this.debtService.findAllByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDTO) {
    return this.debtService.update(+id, updateDebtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtService.remove(+id);
  }
}
