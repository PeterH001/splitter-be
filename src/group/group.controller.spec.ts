import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupGuard } from '../auth/guard';
import { PrismaService } from '../prisma/prisma.service';
import { AddOrRemoveUserDTO, CreateGroupDto, UpdateGroupDTO } from './dto';
import { Currency, Role, User } from '@prisma/client';

describe('GroupController', () => {
  let controller: GroupController;
  const mockGroupService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllByUserId: jest.fn(),
    findMembersByGroupId: jest.fn(),
    getGroupDetails: jest.fn(),
    update: jest.fn(),
    addUser: jest.fn(),
    removeUser: jest.fn(),
    remove: jest.fn(),
    simplifyGroupDebts: jest.fn(),
    leaveGroup: jest.fn(), 
  };
  const mockPrismaService = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        GroupService,
        GroupGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideProvider(GroupService)
      .useValue(mockGroupService)
      .overrideGuard(GroupGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<GroupController>(GroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('new group should be created with user', async () => {
      const id: number = 1;
      const user: User = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        pwhash: 'aaa',
        username: 'testuserUpdated',
        email: 'updated@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.user,
      };
      const dto: CreateGroupDto = {
        groupName: 'testGroup',
        simplify: false,
      };
      const group = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: dto.groupName,
        simplify: dto.simplify,
      };
      mockGroupService.create.mockResolvedValue(group);
      expect(await controller.create(dto, user)).toEqual(group);
    });
  });
  describe('findAll', () => {
    it('should return all groups', async () => {
      const groups = [
        {
          id: 1,
          groupName: 'testGroup1',
        },
        {
          id: 2,
          groupName: 'testGroup2',
        },
      ];
      mockGroupService.findAll.mockResolvedValue(groups);
      expect(await controller.findAll()).toEqual(groups);
    });
  });
  describe('findOne', () => {
    it('should return one group by id', async () => {
      const id = '1';
      const group = {
        id: 1,
        name: 'testGroup',
        simplify: false,
        members: [
          {
            id: 1,
            username: 'testUser',
          },
          {
            id: 2,
            username: 'testUser2',
          },
        ],
      };
      mockGroupService.findOne.mockResolvedValue(group);
      expect(await controller.findOne(id)).toEqual(group);
    });
  });
  describe('findOne', () => {
    it('should return one group by id', async () => {
      const id = '1';
      const group = {
        id: 1,
        name: 'testGroup',
        simplify: false,
        members: [
          {
            id: 1,
            username: 'testUser',
          },
          {
            id: 2,
            username: 'testUser2',
          },
        ],
      };
      mockGroupService.findOne.mockResolvedValue(group);
      expect(await controller.findOne(id)).toEqual(group);
    });
  });
  describe('findAllByUserId', () => {
    it('should return all groups the user is in, with all debts sorted by currencies', async () => {
      const user: User = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        pwhash: 'aaa',
        username: 'testuserUpdated',
        email: 'updated@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.user,
      };
      const groups = [
        {
          id: 1,
          groupName: 'testGroup1',
          debtsByCurrencies: [],
        },
        {
          id: 2,
          groupName: 'testGroup2',
          debtsByCurrencies: [
            {
              amount: 50,
              currency: Currency.EUR,
            },
          ],
        },
      ];
      mockGroupService.findAllByUserId.mockResolvedValue(groups);
      expect(await controller.findAllByUserId(user)).toEqual(groups);
    });
  });
  describe('findMembersByGroupId', () => {
    it('should return all members of a group', async () => {
      const id = '1';
      const members = [
        { id: 1, username: 'testUser' },
        { id: 2, username: 'testUser2' },
        { id: 3, username: 'testUser3' },
      ];
      mockGroupService.findMembersByGroupId.mockResolvedValue(members);
      expect(await controller.findMembersByGroupId(id)).toEqual(members);
    });
  });
  describe('update', () => {
    it('should update a group by id', async () => {
      const id = '1';
      const members = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const dto: UpdateGroupDTO = {
        groupName: 'updatedGroupName',
      };
      const resultGroup = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'updatedGroupName',
        simplify: false,
        members: members
      };
      mockGroupService.update.mockResolvedValue(resultGroup);
      expect(await controller.update(id, dto)).toEqual(resultGroup);
    });
  });
  describe('addUser', () => {
    it('should add a user by id', async () => {
      const id = '1';
      const members = [{ id: 1 }, { id: 2 }, { id: 3 }, {id: 4}];
      const dto: AddOrRemoveUserDTO = {
        id: 4,
      };
      const resultGroup = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup',
        simplify: false,
        members: members
      };
      mockGroupService.addUser.mockResolvedValue(resultGroup);
      expect(await controller.addUser(id, dto)).toEqual(resultGroup);
    });
  });

  describe('removeUser', () => {
    it('should remove a user by id', async () => {
      const id = '1';
      const members = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const dto: AddOrRemoveUserDTO = {
        id: 4,
      };
      const resultGroup = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup',
        simplify: false,
        members: members
      };
      mockGroupService.removeUser.mockResolvedValue(resultGroup);
      expect(await controller.removeUser(id, dto)).toEqual(resultGroup);
    });
  });
  
  describe('leaveGroup', () => {
    it('should remove current user from group', async () => {
      const user: User = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        pwhash: 'aaa',
        username: 'testuserUpdated',
        email: 'updated@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.user,
      };
      const id = '1';
      const members = [{ id: 1 }, { id: 2 }];
      const resultGroup = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testGroup',
        simplify: false,
        members: members
      };
      mockGroupService.leaveGroup.mockResolvedValue(resultGroup)
      expect(await controller.leaveGroup(id, user)).toEqual(resultGroup);
    });
  });

  describe('remove', () => {
    it('should delete the group by id', async () => {
      const id = '1';
      const result =  {
        message: 'this group was deleted:',
        group: id,
      };
      mockGroupService.remove.mockResolvedValue(result);
      expect(await controller.remove(id)).toEqual(result);
    });
  });

});
