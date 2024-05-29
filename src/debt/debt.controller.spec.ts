import { Test, TestingModule } from '@nestjs/testing';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DebtController', () => {
  let controller: DebtController;
  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtController],
      providers: [
        DebtService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<DebtController>(DebtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
