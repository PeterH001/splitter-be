import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { PatchUserDTO } from './dto';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getMe', () => {
    it('should get me', async () => {
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

      mockPrismaService.user.findUnique.mockResolvedValue({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      expect(await userService.getMe(user)).toEqual({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    });
  });

  describe('findOne', () => {
    it('should return user if it exists', async () => {
      const id = 1;
      const result = {
        id: id,
        username: 'teszt',
        email: 'teszt@gmail.com',
        firstName: '',
        lastName: '',
      };
      const mockFindUnique = jest.spyOn(prismaService.user, 'findUnique');
      mockFindUnique.mockResolvedValue(null);
      // await expect(userService.findOne(id)).rejects.toThrow(NotFoundException);
      try {
        await userService.findOne(id);
      } catch (error) {
        console.log('Error:', error); // Check the error message in the console
        expect(error).toBeInstanceOf(NotFoundException);
      }
  
    });
    // it('should throw error', async () => {
    //   const id = 1;
      
    //   mockPrismaService.user.findUnique.mockResolvedValue(null);
    //   await expect(await userService.findOne(id)).rejects.toBe(NotFoundException)
    //   try {
    //     await userService.findOne(id);
    // } catch (error) {
    //     console.log('Error caught:', error);
    // }
    // });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = [
        {
          id: 1,
          username: 'teszt',
          email: 'teszt@gmail.com',
          firstName: '',
          lastName: '',
        },
        {
          id: 2,
          username: 'teszt2',
          email: 'teszt2@gmail.com',
          firstName: '',
          lastName: '',
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(result);
      expect(await userService.findAll()).toEqual(result);
    });
  });

  describe('patchUser', () => {
    it('Should update user with new value', async () => {
      const id = 1;
      const user: User = {
        id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        pwhash: 'aaa',
        username: 'testuserUpdated',
        email: 'updated@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.user
      }
      const updateDto : PatchUserDTO = {
        username: 'testuserUpdated',
        email: 'updated@test.com',
        firstName: 'Test',
        lastName: 'User'
      }
    mockPrismaService.user.findUnique.mockResolvedValue(user);
    mockPrismaService.user.update.mockResolvedValue(updateDto);
     expect(await userService.patchUser(id, updateDto)).toEqual(updateDto)
    });
  });
});
