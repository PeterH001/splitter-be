import { Currency } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class CreatePaymentDTO{
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsEnum(Currency)
    currency: Currency;
    
    @IsNumber()
    @IsNotEmpty()
    balanceId: number;
}