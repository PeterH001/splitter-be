import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PaymentService', () => {
  let service: PaymentService;
  const mockPrismaService = {};

  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
