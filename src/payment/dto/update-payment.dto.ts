import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDTO } from './create-payment.dto';

export class UpdatePaymentDTO extends PartialType(CreatePaymentDTO) {}
