import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
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

    return await this.userService.update(updateUser, req.user.email);
  }

  @Public()
  @Get('id')
  async findOne(@Query('id') id: string, @Request() req) {
    const userID = req.user?.id;
    const user = await this.userService.findById(id ? id : userID);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('users')
  async findAllUser(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.userService.findAllUser({
      page,
      pageSize,
    });
  }
  @Get('staffs')
  async findAllStaff(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.userService.findAllStaff({
      page,
      pageSize,
    });
  }

  @Get('one')
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

  @Put('change-role')
  async changeRole(@Body() body: UpdateRoleDTO) {
    return await this.userService.changeRole(body.role, body.email);
  }
  @Put('change-status')
  async changeStatus(@Body() body) {
    return await this.userService.changeStatus(body.status, body.id);
  }

  @Put('changeToPartner')
  async changeToPartners(@Body() body, @Request() req) {
    const userID = req.user.id;
    return await this.userService.changetoPartner(userID, body);
  }

  @Put('top-up')
  async transaction(@Body() body, @Request() req) {
    const userID = req.user.id;
    return await this.userService.transaction(userID, body.value);
  }
}
