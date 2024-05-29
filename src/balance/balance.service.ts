import { Injectable } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Edge, Money, Vertex } from 'src/types';
import { UserService } from '../user/user.service';
import { Graph } from '../algorithms/simplify';

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

  async calculateMyBalancesByGroup(groupId: number, userId: number) {
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
        
        const youAreOwed =
          userId === balance.userAId
            ? balance.userBDebtsToA
            : balance.userADebtsToB;

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
            youOweGroupedByCurrencies.push({
              amount: -payment.amount,
              currency: payment.currency,
            });
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

        //lehetséges az, hogy valamiből többet fizettél be, mint kellett volna, ezért a youowe negatív előjelű lesz.
        //Ez a balanceByCurrenciesnél rendeződik, ott úgy is előjel alapján szórja szét a tartozásokat
        //kivonni, amennyit már a másik befizetett
        otherPaid.forEach((payment) => {
          const index = youAreOwedGroupedByCurrencies.findIndex(
            (sumWithCurrency) => sumWithCurrency.currency === payment.currency,
          );

          if (index !== -1) {
            youAreOwedGroupedByCurrencies[index].amount -= payment.amount;
          } else {
            //fölöslegesen, pluszba fizetett be olyan valutát, amivel a másik nem is tartozik neki, ezt negatív előjellel beviszem
            youAreOwedGroupedByCurrencies.push({
              amount: -payment.amount,
              currency: payment.currency,
            });
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

        let sumYouOwe: Money[] = [];
        let sumYouAreOwed: Money[] = [];

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

    //te összesen bárkinek mennyivel tartozol, ezeknek a különbsége.
    //Eredmény: a csoportba mennyit kell fizetned, a csoportból mennyit kell visszakapnod ÖSSZESEN, nem csupán emberenként.
    let youOweInGroup: Money[] = [];
    let youAreOwedInGroup: Money[] = [];
    let yourBalanceInGroup: Money[] = [];

    const asd = filteredBalances;
    asd.forEach((filteredBalance) => {
      const youOweToAPerson = filteredBalance.youOwe.map((debt) => ({
        ...debt,
      }));
      const youAreOwedByAPerson = filteredBalance.youAreOwed.map((debt) => ({
        ...debt,
      }));

      youOweToAPerson.forEach((debtByCurrency) => {
        const index = youOweInGroup.findIndex(
          (elem) => elem.currency === debtByCurrency.currency,
        );
        if (index !== -1) {
          youOweInGroup[index].amount += debtByCurrency.amount;
        } else {
          youOweInGroup.push(debtByCurrency);
        }
      });

      youAreOwedByAPerson.forEach((debtByCurrency) => {
        const index = youAreOwedInGroup.findIndex(
          (elem) => elem.currency === debtByCurrency.currency,
        );
        if (index !== -1) {
          youAreOwedInGroup[index].amount += debtByCurrency.amount;
        } else {
          youAreOwedInGroup.push(debtByCurrency);
        }
      });
    });

    yourBalanceInGroup = youAreOwedInGroup.map((debt) => ({ ...debt }));
    youOweInGroup.forEach((debtByCurrency) => {
      const index = yourBalanceInGroup.findIndex(
        (elem) => elem.currency === debtByCurrency.currency,
      );
      if (index !== -1) {
        yourBalanceInGroup[index].amount -= debtByCurrency.amount;
        if (yourBalanceInGroup[index].amount === 0) {
          yourBalanceInGroup.splice(index, 1);
        }
      } else {
        yourBalanceInGroup.push({
          amount: -debtByCurrency.amount,
          currency: debtByCurrency.currency,
        });
      }
    });

    return {
      balances: filteredBalances,
      yourBalanceInGroup,
    };
  }

  async getMyBalancesByGroup(groupId: number, userId: number) {
    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
      },
    });
    let simplify: boolean = group.simplify;
    let myBalances = await this.calculateMyBalancesByGroup(groupId, userId);

    if (simplify) {
      const simplified = await this.simplifyGroupDebts(groupId);
      let simplifiedBalances: {
        id: number;
        groupId: number;
        you: {
          id: number;
          username: string;
        };
        other: {
          id: number;
          username: string;
        };
        youOwe: Money[];
        youAreOwed: Money[];
      }[] = myBalances.balances.map((balance) => ({
        id: balance.id,
        groupId: balance.groupId,
        you: balance.you,
        other: balance.other,
        youOwe: ([] = []),
        youAreOwed: ([] = []),
      }));
      simplified.forEach((simplifiedByCurrency) => {
        const edgesOfUser = simplifiedByCurrency.edges.filter(
          (edge) => edge.source.id === userId || edge.drain.id === userId,
        );
        edgesOfUser.forEach((edge) => {
          if (edge.source.id === userId) {
            let balance = simplifiedBalances.find(
              (simplifiedBalance) =>
                simplifiedBalance.you.id === edge.source.id &&
                simplifiedBalance.other.id === edge.drain.id,
            );
            balance.youOwe.push({
              amount: edge.amount,
              currency: simplifiedByCurrency.currency,
            });
          } else if (edge.drain.id === userId) {
            let balance = simplifiedBalances.find(
              (simplifiedBalance) =>
                simplifiedBalance.you.id === edge.drain.id &&
                simplifiedBalance.other.id === edge.source.id,
            );
            balance.youAreOwed.push({
              amount: edge.amount,
              currency: simplifiedByCurrency.currency,
            });
          }
        });
      });

      myBalances.balances = simplifiedBalances;
    }

    return myBalances;
  }

  async yourGroupBalance(groupId: number, userId: number) {
    const result = await this.calculateMyBalancesByGroup(groupId, userId);
    return result.yourBalanceInGroup;
  }

  async findBalance(groupId: number, userId1: number, userId2: number) {
    return await this.prismaService.balance.findFirst({
      where: {
        groupId: groupId,
        OR: [
          { userAId: userId1, userBId: userId2 },
          { userAId: userId2, userBId: userId1 },
        ],
      },
    });
  }

  async findBalancesByGroupId(groupId: number) {
    return await this.prismaService.balance.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        userADebtsToB: {
          select: {
            amount: true,
            currency2: true,
          },
        },
        userAPaid: {
          select: {
            amount: true,
            currency: true,
          },
        },
        userBDebtsToA: {
          select: {
            amount: true,
            currency2: true,
          },
        },
        userBPaid: {
          select: {
            amount: true,
            currency: true,
          },
        },
      },
    });
  }

  async simplifyGroupDebts(groupId: number) {
    let vertices: Vertex[] = [];
    let edgesByCurrencies: { edges: Edge[]; currency: Currency }[] = [];
    let groupBalances: any[] = [];

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const members = group.members;
    members.map((member) => {
      vertices.push({ id: member.id, username: member.username });
    });

    groupBalances = await this.findBalancesByGroupId(groupId);
   
    groupBalances.forEach((balance) => {
      let userAowesToBByCurrencies: Money[] = [];
      let userBowesToAByCurrencies: Money[] = [];

      //összegyűjtjük valutánként a tartozás mértékét
      balance.userADebtsToB.forEach((debt) => {
        const index = userAowesToBByCurrencies.findIndex(
          (debtByCurrency) => debtByCurrency.currency === debt.currency2,
        );

        if (index != -1) {
          userAowesToBByCurrencies[index].amount += debt.amount;
        } else {
          userAowesToBByCurrencies.push({
            amount: debt.amount,
            currency: debt.currency2,
          });
        }
      });

      //kivonjuk, amennyit már kifizetett
      balance.userAPaid.forEach((payment) => {
        const index = userAowesToBByCurrencies.findIndex(
          (debtByCurrency) => debtByCurrency.currency === payment.currency,
        );

        if (index != -1) {
          const result = (userAowesToBByCurrencies[index].amount -=
            payment.amount);
          if (result === 0) {
            //ha kiegyenlítette a tartozást, kivesszük a listából
            userAowesToBByCurrencies.splice(index, 1);
          }
        } else {
          userAowesToBByCurrencies.push({
            amount: -payment.amount,
            currency: payment.currency,
          });
        }
      });

      balance.userBDebtsToA.forEach((debt) => {
        const index = userBowesToAByCurrencies.findIndex(
          (debtByCurrency) => debtByCurrency.currency === debt.currency2,
        );

        if (index != -1) {
          userBowesToAByCurrencies[index].amount += debt.amount;
        } else {
          userBowesToAByCurrencies.push({
            amount: debt.amount,
            currency: debt.currency2,
          });
        }
      });

      //kivonjuk, amennyit már kifizetett
      balance.userBPaid.forEach((payment) => {
        const index = userBowesToAByCurrencies.findIndex(
          (debtByCurrency) => debtByCurrency.currency === payment.currency,
        );

        if (index != -1) {
          const result = (userBowesToAByCurrencies[index].amount -=
            payment.amount);
          if (result === 0) {
            //ha kiegyenlítette a tartozást, kivesszük a listából
            userBowesToAByCurrencies.splice(index, 1);
          }
        } else {
          userBowesToAByCurrencies.push({
            amount: -payment.amount,
            currency: payment.currency,
          });
        }
      });

      //b tartozásait kivonom a-ból
      userBowesToAByCurrencies.forEach((bOwes) => {
        const index = userAowesToBByCurrencies.findIndex(
          (aOwes) => aOwes.currency === bOwes.currency,
        );

        if (index != -1) {
          const result = (userAowesToBByCurrencies[index].amount -=
            bOwes.amount);
          if (result === 0) {
            //ha A és B tartozása egymás felé ugyanakkora
            userAowesToBByCurrencies.splice(index, 1);
          }
        } else {
          userAowesToBByCurrencies.push({
            amount: -bOwes.amount,
            currency: bOwes.currency,
          });
        }
      });

      userAowesToBByCurrencies.forEach((debt) => {
        let source: Vertex;
        let drain: Vertex;
        let amount: number;

        if (debt.amount > 0) {
          source = vertices.find((vertex) => vertex.id === balance.userAId);
          drain = vertices.find((vertex) => vertex.id === balance.userBId);
          amount = debt.amount;
        } else if (debt.amount < 0) {
          source = vertices.find((vertex) => vertex.id === balance.userBId);
          drain = vertices.find((vertex) => vertex.id === balance.userAId);
          amount = -debt.amount;
        } else {
          throw new Error("debt can't be 0");
        }
        const newEdge: Edge = { source, drain, amount };

        const index = edgesByCurrencies.findIndex(
          (edgesOfACurrency) => edgesOfACurrency.currency === debt.currency,
        );

        if (index !== -1) {
          edgesByCurrencies[index].edges.push(newEdge);
        } else {
          edgesByCurrencies.push({ edges: [newEdge], currency: debt.currency });
        }
      });
    });

    edgesByCurrencies.forEach((edgesOfACurrency) => {
      let graph: Graph = new Graph(vertices, edgesOfACurrency.edges);
      //Simplify
      const result = graph.simplify();
      let simplifiedEdges: Edge[] = [];
      result.forEach((simplifiedEdge) => {
        const source: Vertex = simplifiedEdge.source.name;
        const drain: Vertex = simplifiedEdge.drain.name;
        const amount = simplifiedEdge.amount;
        const newEdgeOfACurrency: Edge = {
          source,
          drain,
          amount,
        };
        simplifiedEdges.push(newEdgeOfACurrency);
      });
      edgesOfACurrency.edges = simplifiedEdges;
    });
    return edgesByCurrencies;
  }
}
