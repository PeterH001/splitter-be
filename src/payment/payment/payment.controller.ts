import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../dto';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService){}

    @Post()
    createPayment(@Body() dto: CreatePaymentDTO){
        return this.paymentService.createPayment(dto);
    }

    @Get()
    findAll(){
      return this.paymentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string){
      return this.paymentService.findOne(+id);
    }

    @Get('group/:id')
    findByGroupId(@Param('id') groupId: string){
      return this.paymentService.findByGroupId(+groupId);
    }

    @Patch(':id')
    updateById(@Param('id') id: string, @Body() dto: UpdatePaymentDTO){
      return this.paymentService.updateById(+id, dto);
    }

    @Delete(':id')
    deleteById(@Param('id') id: string){
      return this.paymentService.deleteById(+id);
    }
  }
