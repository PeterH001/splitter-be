import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from '../payment/payment/payment.service';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  const mockPrismaService = {};
  const mockPaymentService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [ExpenseService,
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
