import { Currency } from "@prisma/client";

export type Money = {
  amount: number;
  currency: Currency;
};
