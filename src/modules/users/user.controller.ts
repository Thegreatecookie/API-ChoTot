import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from 'src/dto/create-user.dto';
import { Public, Roles } from 'src/configs/configuration';
import { UpdateUserDTO } from 'src/dto/update-user.dto';
import { Role } from 'src/enums/role.enums';
import { ChangePasswordDTO } from 'src/dto/update-password.dto';
import { UpdateRoleDTO } from 'src/dto/update-role.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('create')
  async create(@Body() createUser: CreateUserDTO) {
    return await this.userService.create(createUser);
  }

  @Put('update')
  async update(@Request() req, @Body() updateUser: UpdateUserDTO) {
    console.log(updateUser);
    return await this.userService.update(updateUser, req.user.email);
  }

  @Get()
  async get(@Request() req) {
    return await this.userService.findOne(req.user.email);
  }

  @Delete('delete')
  async delete(@Request() req) {
    return await this.userService.delete(req.user.email);
  }

  @Put('update-password')
  async updateRole(@Request() req, @Body() password: ChangePasswordDTO) {
    return await this.userService.changePassword(password, req.user.email);
  }

  @Roles(Role.Admin)
  @Put('change-role')
  async changeRole(@Body() body: UpdateRoleDTO) {
    return await this.userService.changeRole(body.role, body.email);
  }
}
