import { Module } from '@nestjs/common';
import { PaymentService } from './payment/payment.service';
import { PaymentController } from './payment/payment.controller';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  exports:[PaymentService],
})
export class PaymentModule {}
