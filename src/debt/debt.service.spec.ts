import { Test, TestingModule } from '@nestjs/testing';
import { DebtService } from './debt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DebtService', () => {
  let service: DebtService;
  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DebtService>(DebtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
