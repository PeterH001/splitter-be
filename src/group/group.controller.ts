import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDTO } from './dto/update-group.dto';
import { GroupGuard, JwtGuard, RolesGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { AddOrRemoveUserDTO } from './dto/add-or-remove-user.dto';

@UseGuards(JwtGuard)
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: User) {
    console.log("createGroupDto: ", createGroupDto);
    
    return this.groupService.create(createGroupDto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get('mygroups')
  findAllByUserId(@GetUser() user: User) {
    return this.groupService.findAllByUserId(user.id);
  }

  @UseGuards(GroupGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @UseGuards(GroupGuard)
  @Get(':id/details')
  getGroupDetails(@Param('id') id: string, @GetUser() user: User) {
    return this.groupService.getGroupDetails(+id, user.id);
  }

  @UseGuards(GroupGuard)
  @Get(':id/members')
  findMembersByGroupId(@Param('id') id: string) {
    return this.groupService.findMembersByGroupId(+id);
  }

  @UseGuards(GroupGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDTO) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @UseGuards(GroupGuard)
  @Patch(':id/adduser')
  addUser(@Param('id') id: string, @Body() addUserDto: AddOrRemoveUserDTO) {
    return this.groupService.addUser(+id, addUserDto);
  }

  @UseGuards(GroupGuard)
  @Patch(':id/removeuser')
  removeUser(@Param('id') id: string, @Body() addUserDto: AddOrRemoveUserDTO) {
    return this.groupService.removeUser(+id, addUserDto);
  }

  @UseGuards(GroupGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
