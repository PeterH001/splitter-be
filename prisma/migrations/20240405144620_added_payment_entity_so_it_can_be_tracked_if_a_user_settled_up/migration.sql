-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "balanceIdA" INTEGER,
    "balanceIdB" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_balanceIdA_fkey" FOREIGN KEY ("balanceIdA") REFERENCES "Balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_balanceIdB_fkey" FOREIGN KEY ("balanceIdB") REFERENCES "Balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
