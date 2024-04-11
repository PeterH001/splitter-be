-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "balanceIdA" INTEGER,
ADD COLUMN     "balanceIdB" INTEGER;

-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userAId" INTEGER NOT NULL,
    "userBId" INTEGER NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_balanceIdA_fkey" FOREIGN KEY ("balanceIdA") REFERENCES "Balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_balanceIdB_fkey" FOREIGN KEY ("balanceIdB") REFERENCES "Balance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
