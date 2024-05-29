import { HttpException, HttpStatus, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatchUserDTO } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async getMe(user: User) {
    const resultUser = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
        email: user.email,
      },
      select: {
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return resultUser;
  }

  async findOne(id: number){
    const result =  await this.prismaService.user.findUnique({
      where:{
        id
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    })
    if(!result){
      throw new NotFoundException('User not found');
    }
    
    return result;
  }

  async findAll() {
    return await this.prismaService.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
  }

  async patchUser(id: number, dto: PatchUserDTO) {
    try {
      const currentUser: User = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });

      if (currentUser.email !== dto.email) {
        const existingUser = await this.prismaService.user.findUnique({
          where: {
            email: dto.email,
          },
        });
        if (existingUser) {
          throw new HttpException('Email is already in use.', HttpStatus.BAD_REQUEST);
        }
      }

      if (currentUser.username !== dto.username) {
        const existingUser = await this.prismaService.user.findUnique({
          where: {
            username: dto.username,
          },
        });
        if (existingUser) {
          throw new HttpException('Username is already in use.', HttpStatus.BAD_REQUEST);
        }
      }
      return this.prismaService.user.update({
        where: {
          id,
        },
        data: dto,
        select:{
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
