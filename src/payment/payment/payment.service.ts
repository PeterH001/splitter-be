import { Injectable, UseGuards } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../dto';

@UseGuards(JwtGuard)
@Injectable()
export class PaymentService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.payment.findMany();
  }
  async findOne(id: number) {
    return await this.prismaService.payment.findUnique({
      where: { id },
    });
  }

  async updateById(id: number, dto: UpdatePaymentDTO) {
    return await this.prismaService.payment.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteById(id: number) {
    return await this.prismaService.payment.delete({
      where: { id },
    });
  }

  async createPayment(dto: CreatePaymentDTO) {
    console.log('dto: ', dto);
    try {
      const balance = await this.prismaService.balance.findUnique({
        where: {
          id: dto.balanceId,
        },
      });

      //megkapom annak a usernek az id-ját, aki befizetett. A balanceId-t is tudom.
      //Csak azt nem tudom, hogy a befizető a balanceban userA vagy userB
      let data;
      const isUserA = balance.userAId === dto.userId;
      console.log(isUserA);

      if (isUserA) {
        data = {
          userId: dto.userId,
          amount: dto.amount,
          currency: dto.currency,
          balanceIdA: dto.balanceId,
        };
      } else {
        data = {
          userId: dto.userId,
          amount: dto.amount,
          currency: dto.currency,
          balanceIdB: dto.balanceId,
        };
      }
      console.log('in createPayment!!: ', data);
      return await this.prismaService.payment.create({
        data: data,
      });
    } catch (error) {
      throw error;
    }
  }

  async findByGroupId(groupId: number) {
    const balances = await this.prismaService.balance.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
          },
        },
        userAPaid: {
          select: {
            amount: true,
            currency: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
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

    const paymentsOfBalances = balances.map((balance) => ({
      userAId: balance.userA.id,
      userAname: balance.userA.username,
      userAPaid: balance.userAPaid,
      userBId: balance.userB.id,
      userBname: balance.userB.username,
      userBPaid: balance.userBPaid,
    }));

    return paymentsOfBalances;
  }
}
