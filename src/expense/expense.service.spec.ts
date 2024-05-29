import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExpenseService', () => {
  let service: ExpenseService;
  const mockPrismaService = {};


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
