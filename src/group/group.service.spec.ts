import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { PrismaService } from '../prisma/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { PaymentService } from '../payment/payment/payment.service';
import { CreateGroupDto } from './dto';
import { Currency, Distribution, ExpenseCategory, Role } from '@prisma/client';

describe('GroupService', () => {
  let service: GroupService;
  const mockPrismaService = {
    group: {
      create: jest.fn(),
      findMany: jest.fn(),
      findOne: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockBalanceService = {
    getMyBalancesByGroup: jest.fn(),
    findBalance: jest.fn(),
    createBalance: jest.fn(),
  };
  const mockPaymentService = {
    findByGroupId: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  describe('create', () => {
    it('should create a group from dto with current user', async () => {
      const dto: CreateGroupDto = {
        groupName: 'testGroup',
        simplify: false,
        userIds: [],
      };

      const user = {
        id: 1,
        username: 'testUser',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@test.hu',
        pwhash: 'aaa',
        role: Role.user,
        firstName: '',
        lastName: '',
      };

      const group = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: dto.groupName,
        simplify: dto.simplify,
      };
      mockPrismaService.group.create.mockReturnValue(group);
      expect(await service.create(dto, user)).toEqual(group);
    });

    it('should create a group from dto with with users in the dto', async () => {
      const userIds = [];
      const dto: CreateGroupDto = {
        groupName: 'testGroup',
        simplify: false,
        userIds: [1],
      };

      const user = {
        id: 1,
        username: 'testUser',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@test.hu',
        pwhash: 'aaa',
        role: Role.user,
        firstName: '',
        lastName: '',
      };

      const group = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: dto.groupName,
        simplify: dto.simplify,
      };
      mockPrismaService.group.create.mockReturnValue(group);
      expect(await service.create(dto, user)).toEqual(group);
    });
  });

  describe('findall', () => {
    it('should find all groups', async () => {
      const groups = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testGroup1',
          simplify: false,
        },
        {
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testGroup2',
          simplify: false,
        },
      ];
      const result = [
        {
          id: 1,
          groupName: 'testGroup1',
        },
        {
          id: 2,
          groupName: 'testGroup2',
        },
      ];
      mockPrismaService.group.findMany.mockReturnValue(groups);
      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should find one group by id', async () => {
      const id = 1;
      const result = {
        id: 1,
        name: 'testGroup1',
        simplify: false,
        members: [
          {
            id: 1,
            usernsame: 'tesstUser',
          },
        ],
      };
      mockPrismaService.group.findUnique.mockReturnValue(result);
      expect(await service.findOne(id)).toEqual(result);
    });
  });

  describe('findAllByUserId', () => {
    it('should find all groups in wich user is a member', async () => {
      const id = 1;
      const expenses1 = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testExpense1',
          payerId: 2,
          groupId: 1,
          amount: 1000,
          currency: Currency.EUR,
          category: ExpenseCategory.Grocery,
          distribution: Distribution.equal,
          description: '',
          debts: [
            {
              amount: 500,
              currency2: Currency.EUR,
            },
          ],
        },
        {
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testExpense2',
          payerId: 3,
          groupId: 1,
          amount: 15000,
          currency: Currency.HUF,
          category: ExpenseCategory.Grocery,
          distribution: Distribution.equal,
          description: '',
          debts: [
            {
              amount: 5000,
              currency2: Currency.HUF,
            },
          ],
        },
      ];
      const expenses2 = [
        {
          id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testExpense3',
          payerId: 2,
          groupId: 1,
          amount: 1000,
          currency: Currency.EUR,
          category: ExpenseCategory.Grocery,
          distribution: Distribution.equal,
          description: '',
          debts: [
            {
              amount: 500,
              currency2: Currency.EUR,
            },
          ],
        },
        {
          id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testExpense4',
          payerId: 3,
          groupId: 1,
          amount: 15000,
          currency: Currency.HUF,
          category: ExpenseCategory.Grocery,
          distribution: Distribution.equal,
          description: '',
          debts: [
            {
              amount: 5000,
              currency2: Currency.HUF,
            },
          ],
        },
      ];
      const groups = [
        {
          id: 1,
          name: 'testGroup1',
          createdAt: new Date(),
          updatedAt: new Date(),
          simplify: false,
          expenses: expenses1,
        },
        {
          id: 2,
          name: 'testGroup2',
          createdAt: new Date(),
          updatedAt: new Date(),
          simplify: false,
          expenses: expenses2,
        },
      ];

      const result = [
        {
          groupId: 1,
          groupName: 'testGroup1',
          debtsByCurrencies: [
            {
              amount: 500,
              currency: Currency.EUR,
            },
            {
              amount: 5000,
              currency: Currency.HUF,
            },
          ],
        },
        {
          groupId: 2,
          groupName: 'testGroup2',
          debtsByCurrencies: [
            {
              amount: 500,
              currency: Currency.EUR,
            },
            {
              amount: 5000,
              currency: Currency.HUF,
            },
          ],
        },
      ];

      mockPrismaService.group.findMany.mockReturnValue(groups);
      expect(await service.findAllByUserId(id)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      const id = 1;
      const members = [
        {
          id: 1,
          username: 'testUser1',
        },
        {
          id: 2,
          username: 'testUser2',
        },
      ];
      const group = {
        id: id,
        name: 'testGroup1',
        simplify: false,
        members: members,
      };
      mockPrismaService.group.findUnique.mockReturnValue(group);
      expect(await service.findOne(id)).toEqual(group);
    });
  });

  describe('getGroupDetails', () => {
    it('should return the group details with the expenses, payments and the balance of the logged in user in the group', async () => {
      const id = 1;
      const userId = 1;
      const members = [
        { id: 1, username: 'Peti', firstName: null, lastName: null },
        { id: 4, username: 'peti 4 ', firstName: null, lastName: null },
        {
          id: 3,
          username: 'peti 3 szerkesztett',
          firstName: null,
          lastName: null,
        },
      ];

      mockPrismaService.group.findUnique.mockResolvedValue({
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup1',
        simplify: false,
        members: members,
        expenses: [
          {
            id: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: '1',
            payerId: 1,
            groupId: 2,
            amount: 1000,
            currency: 'HUF',
            category: 'Grocery',
            distribution: 'equal',
            description: '',
            payer: { id: 1, username: 'Peti', firstName: null, lastName: null },
            debts: [
              {
                amount: 250,
                currency2: Currency.HUF,
              },
            ],
          },
          {
            id: 11,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'mammut',
            payerId: 4,
            groupId: 2,
            amount: 500,
            currency: 'HUF',
            category: 'Grocery',
            distribution: 'equal',
            description: '',
            payer: {
              id: 4,
              username: 'peti 4 ',
              firstName: null,
              lastName: null,
            },
            debts: [
              {
                amount: 250,
                currency2: Currency.HUF,
              },
            ],
          },
        ],
      });

      const balanceOfUser = [
        {
          id: 1,
          groupId: 1,
          you: {
            id: 1,
            username: 'Peti',
          },
          other: {
            id: 4,
            username: 'peti 4 ',
          },
          youOwe: [
            {
              amount: 250,
              currency: Currency.HUF,
            },
          ],
          youAreOwed: [],
        },
        {
          id: 2,
          groupId: 1,
          you: {
            id: 1,
            username: 'Peti',
          },
          other: {
            id: 3,
            username: 'peti 3 szerkesztett',
          },
          youOwe: [],
          youAreOwed: [],
          yourBalanceInGroup: [
            {
              amount: 250,
              currency: Currency.HUF,
            },
          ],
        },
      ];

      const payments = [
        {
          userAId: 1,
          userAname: 'Peti',
          userAPaid: [],
          userBId: 3,
          userBname: 'peti 3 szerkesztett',
          userBPaid: [],
        },
        {
          userAId: 1,
          userAname: 'Peti',
          userAPaid: [],
          userBId: 4,
          userBname: 'peti 4 ',
          userBPaid: [],
        },
        {
          userAId: 4,
          userAname: 'peti 4 ',
          userAPaid: [],
          userBId: 3,
          userBname: 'peti 3 szerkesztett',
          userBPaid: [],
        },
      ];

      const filteredExpenses = [
        {
          id: 5,
          category: ExpenseCategory.Grocery,
          amount: 1000,
          currency: Currency.HUF,
          debtAmount: 250,
          distribution: Distribution.equal,
          name: '1',
          payerName: 'Peti',
        },
        {
          id: 11,
          category: ExpenseCategory.Grocery,
          amount: 500,
          currency: Currency.HUF,
          debtAmount: 250,
          distribution: Distribution.equal,
          name: 'mammut',
          payerName: 'peti 4 ',
        },
      ];
      const result = {
        id: 1,
        name: 'testGroup1',
        members: members,
        expenses: filteredExpenses,
        balanceOfUser: balanceOfUser,
        payments: payments,
      };

      mockBalanceService.getMyBalancesByGroup.mockResolvedValue(balanceOfUser);
      mockPaymentService.findByGroupId.mockResolvedValue(payments);
      expect(await service.getGroupDetails(id, userId)).toEqual(result);
    });
  });

  describe('findMembersByGroupId', () => {
    it('should return the members of a group', async () => {
      const id = 1;
      const members = [
        {
          id: 1,
          username: 'testUser1',
        },
        {
          id: 2,
          username: 'testUser2',
        },
      ];

      const group = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup1',
        simplify: false,
        members: members,
      };

      mockPrismaService.group.findUnique.mockResolvedValue(group);
      expect(await service.findMembersByGroupId(id)).toEqual(members);
    });
  });

  describe('update', () => {
    it('should rename a group by id', async () => {
      const id = 1;
      const dto = { groupName: 'updatedGroup', userIds: [] };

      const members = [1, 2, 3];

      const ugroup = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup',
        simplify: false,
        members: members,
      };

      const updatedGroup = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'updatedGroup',
        simplify: false,
        members: members,
      };

      mockPrismaService.group.update.mockResolvedValue(updatedGroup);
      expect(await service.update(id, dto)).toEqual(updatedGroup);
    });

    it('should add a user to a group by id', async () => {
      const id = 1;
      const dto = { groupName: 'updatedGroup', userIds: [4] };

      const members = [1, 2, 3];

      const group = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup',
        simplify: false,
        members: members,
      };

      const updatedGroup = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'updatedGroup',
        simplify: false,
        members: members,
      };

      mockPrismaService.group.update.mockResolvedValue(updatedGroup);
      
      mockBalanceService.findBalance.mockReturnValue(false);
      mockBalanceService.createBalance((id: number, userAId: number, userBId: number)=>{
        return {
          id: 1,
          groupId: id,
          userAId,
          userBId,
        }
      });
      expect(await service.update(id, dto)).toEqual(updatedGroup);
    });
  });
});
