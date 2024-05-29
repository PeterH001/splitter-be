import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from '@prisma/client';

describe('UserController', () => {
  let userController: UserController;

  const mockUserService = {
    getMe: jest.fn((dto) => {
      return {
        username: dto.username,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      };
    }),

    patchUser: jest.fn((id, dto) => {
      return {
        username: dto.username,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      };
    }),

    findAll: jest.fn(() => {
      return [
        { id: 1, username: 'test1' },
        { id: 2, username: 'test2' },
      ];
    }),

    findOne: jest.fn(() => {
      return { id: 1, username: 'test1' };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    userController = module.get<UserController>(UserController);
  });

  it('should get me', () => {
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

    expect(userController.getMe(user)).toEqual({
      username: 'testUser',
      email: 'test@test.hu',
      firstName: '',
      lastName: '',
    });
  });

  it('should find all users', () => {
    const result = [
      { id: 1, username: 'test1' },
      { id: 2, username: 'test2' },
    ];
    expect(userController.findAll()).toEqual(result);
  });

  it('should find one user by userId', () => {
    const id = '1';
    const result = { id: 1, username: 'test1' };
    expect(userController.findOne(id)).toEqual(result);
  });

  it('should update one user by userId', () => {
    const dto = {
      username: 'testUser',
      email: 'test@test.hu',
      firstName: 'Test',
      lastName: 'User',
    };
    expect(userController.updateById('1', dto)).toEqual({
      ...dto,
    });
  });
});
