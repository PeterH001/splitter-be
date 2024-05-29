import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

describe('BalanceService', () => {
  let service: BalanceService;
  const mockPrismaService = {};
  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
