import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { GroupGuard } from '../auth/guard';
import { PrismaService } from '../prisma/prisma.service';

describe('BalanceController', () => {
  let controller: BalanceController;
  const mockBalanceService = {};
  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [BalanceService, GroupGuard, {
        provide: PrismaService,
        useValue: mockPrismaService,
      },],
    })
      .overrideProvider(BalanceService)
      .useValue(mockBalanceService)
      .overrideGuard(GroupGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BalanceController>(BalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
