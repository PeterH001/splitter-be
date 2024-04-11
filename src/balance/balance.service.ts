import { Injectable } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BalanceService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}
  async createBalance(groupId: number, userAId: number, userBId: number) {
    return this.prismaService.balance.create({
      data: {
        group: { connect: { id: groupId } },
        userA: { connect: { id: userAId } },
        userB: { connect: { id: userBId } },
      },
    });
  }

  async getMyBalancesByGroup(groupId: number, userId: number) {
    const balances = await this.prismaService.balance.findMany({
      where: {
        groupId: groupId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userADebtsToB: true,
        userBDebtsToA: true,
        userAPaid: true,
        userBPaid: true,
      },
    });

    const filteredBalances = await Promise.all(
      balances.map(async (balance) => {
        const youOwe =
          userId === balance.userAId
            ? balance.userADebtsToB
            : balance.userBDebtsToA;
        // console.log('youOwe:', youOwe);
        const youAreOwed =
          userId === balance.userAId
            ? balance.userBDebtsToA
            : balance.userADebtsToB;
        // console.log('youAreOwed:', youAreOwed);

        const youPaid =
          userId === balance.userAId ? balance.userAPaid : balance.userBPaid;
        const otherPaid =
          userId === balance.userAId ? balance.userBPaid : balance.userAPaid;

        let youOweGroupedByCurrencies: {
          amount: number;
          currency: Currency;
        }[] = [];

        let youAreOwedGroupedByCurrencies: {
          amount: number;
          currency: Currency;
        }[] = [];

        youOwe.forEach((debt) => {
          const index = youOweGroupedByCurrencies.findIndex(
            (debtByCurrency) => debtByCurrency.currency === debt.currency2,
          );
          //ha még nincs össztartozás ilyen valutával, pusholja az arrayba, ha már van, hozzáadja az összeghez a kiadást
          if (index !== -1) {
            youOweGroupedByCurrencies[index].amount += debt.amount;
          } else {
            youOweGroupedByCurrencies.push({
              amount: debt.amount,
              currency: debt.currency2,
            });
          }
        });

        //lehetséges az, hogy valamiből többet fizettél be, mint kellett volna, ezért a youowe negatív előjelű lesz. 
        //Ez a balanceByCurrenciesnél rendeződik, ott úgy is előjel alapján szórja szét a tartozásokat
        //kivonni, amennyit már befizettél
        youPaid.forEach((payment) => {
          const index = youOweGroupedByCurrencies.findIndex(
            (sumWithCurrency) => sumWithCurrency.currency === payment.currency,
          );

          if (index !== -1) {
            youOweGroupedByCurrencies[index].amount -= payment.amount;
          } else {
            //fölöslegesen, pluszba fizetett be olyan valutát, amivel a másik nem is tartozik neki, ezt negatív előjellel beviszem
            youOweGroupedByCurrencies.push({amount: -payment.amount, currency: payment.currency})
          }
        });

        //mennyivel tartoznak neked
        youAreOwed.forEach((debt) => {
          const index = youAreOwedGroupedByCurrencies.findIndex(
            (debtByCurrency) => debtByCurrency.currency === debt.currency2,
          );
          //ha még nincs össztartozás ilyen valutával, pusholja az arrayba, ha már van, hozzáadja az összeghez a kiadást
          if (index !== -1) {
            youAreOwedGroupedByCurrencies[index].amount += debt.amount;
          } else {
            youAreOwedGroupedByCurrencies.push({
              amount: debt.amount,
              currency: debt.currency2,
            });
          }
        });

        //TODO: ITT KIVONNI AZ OTHERPAIDET
        //lehetséges az, hogy valamiből többet fizettél be, mint kellett volna, ezért a youowe negatív előjelű lesz. 
        //Ez a balanceByCurrenciesnél rendeződik, ott úgy is előjel alapján szórja szét a tartozásokat
        //kivonni, amennyit már a másik befizetett
        console.log("mennyivel tartoznak neked, currencynként csoportosítva:", youAreOwedGroupedByCurrencies);
        console.log("a másik mennyi micsodát fizetett: ", otherPaid);
        
        otherPaid.forEach((payment) => {
          console.log("otherpaid payment: ", payment);
          
          const index = youAreOwedGroupedByCurrencies.findIndex(
            (sumWithCurrency) => sumWithCurrency.currency === payment.currency,
          );

          if (index !== -1) {
            youAreOwedGroupedByCurrencies[index].amount -= payment.amount;
          } else {
            //fölöslegesen, pluszba fizetett be olyan valutát, amivel a másik nem is tartozik neki, ezt negatív előjellel beviszem
            youAreOwedGroupedByCurrencies.push({amount: -payment.amount, currency: payment.currency})
          }
        });

        let balanceByCurrencies = youOweGroupedByCurrencies;

        //minden felém irányuló tartozásra megnézi, hogy ilyen valutával tartozom-e a másik félnek, az alapján vagy kivonja abból az összeget, vagy pusholja negatív előjellel
        youAreOwedGroupedByCurrencies.forEach((debtYouAreOwed) => {
          const index = balanceByCurrencies.findIndex(
            (debtYouOwe) => debtYouOwe.currency === debtYouAreOwed.currency,
          );

          if (index !== -1) {
            balanceByCurrencies[index].amount -= debtYouAreOwed.amount;
          } //ha nem talál ilyen valutájú tartozást, negatív előjellel bepusholja, hisz a másik tartozik neked ennyi ilyen valutával
          else {
            balanceByCurrencies.push({
              amount: -debtYouAreOwed.amount,
              currency: debtYouAreOwed.currency,
            });
          }
        });

        let sumYouOwe: { amount: number; currency: Currency }[] = [];
        let sumYouAreOwed: { amount: number; currency: Currency }[] = [];

        balanceByCurrencies.forEach((balanceByCurrency) => {
          if (balanceByCurrency.amount > 0) {
            sumYouOwe.push(balanceByCurrency);
          }
          if (balanceByCurrency.amount < 0) {
            sumYouAreOwed.push({
              amount: -balanceByCurrency.amount,
              currency: balanceByCurrency.currency,
            });
          }
        });

        // console.log('balanceByCurrencies2: ', balanceByCurrencies);

        // console.log('sumyouAreOwedByCurrencies: ', youAreOwedGroupedByCurrencies);
        const userA = await this.userService.findOne(balance.userAId);
        const userB = await this.userService.findOne(balance.userBId);
        let you: { id: number; username: string };
        let other: { id: number; username: string };
        if (userId === balance.userAId) {
          you = { id: userA.id, username: userA.username };
          other = { id: userB.id, username: userB.username };
        } else {
          you = { id: userB.id, username: userB.username };
          other = { id: userA.id, username: userA.username };
        }

        return {
          id: balance.id,
          groupId: balance.groupId,
          you,
          other,
          youOwe: sumYouOwe,
          youAreOwed: sumYouAreOwed,
        };
      }),
    );
    return filteredBalances;
  }
}
