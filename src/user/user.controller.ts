import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard, RolesGuard } from '../auth/guard';
import { UserService } from './user.service';
import { FindUserDTO, PatchUserDTO } from './dto';
import { Roles } from '../auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('me')
  patchMe(@GetUser() user: User, @Body() dto: PatchUserDTO) {
    return this.userService.patchUser(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Patch(':id')
  updateById(@Param('id') id: string, @Body() dto: PatchUserDTO) {
    return this.userService.patchUser(+id, dto);
  }
}
