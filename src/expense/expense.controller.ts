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
import { ExpenseService } from './expense.service';
import { CreateExpenseDTO, UpdateExpenseDTO } from './dto';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { GetUser, Roles } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { ExpenseGuard } from 'src/auth/guard/expense.guard';

@UseGuards(JwtGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDTO) {
    console.log("create in expensecontroller called, dto:", createExpenseDto);
    
    return this.expenseService.create(createExpenseDto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @Get('group/:id')
  findAllByGroupId(@Param('id') id: string) {
    return this.expenseService.findAllByGroupId(id);
  }

  @Get('user/:id')
  findAllByUserId(@Param('id') id: string) {
    return this.expenseService.findAllByUserId(id);
  }

  @Get('myexpenses')
  findMyExpenses(@GetUser() user: User) {
    return this.expenseService.findMyExpenses(user.id);
  }
  
  @Get('categories')
  getExpenseCategories(){
    return this.expenseService.getExpenseCategories();
  }

  @Get('distributiontypes')
  getExpenseDistributions(){
    return this.expenseService.getExpenseDistributions();
  }

  @Get('currencies')
  getCurrencies(){
    return this.expenseService.getCurrencies();
  }

  @UseGuards(ExpenseGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDTO) {
    return this.expenseService.update(+id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(+id);
  }
}
