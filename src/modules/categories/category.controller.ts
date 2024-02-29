import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  Query,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Category } from 'src/schemas/category.schema';
import { CreateCategoryDTO } from 'src/dto/create-category.dto';
import { CategoryService } from './category.service';
import { UpdateCategoryDTO } from 'src/dto/update-category.dto';
import { Public, Roles } from 'src/configs/configuration';
import { Role } from 'src/enums/role.enums';
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  async create(@Body() createCategory: CreateCategoryDTO) {
    return await this.categoryService.create(createCategory);
  }

  @Put('update')
  async update(@Body() updatePost: UpdateCategoryDTO) {
    return await this.categoryService.update(updatePost);
  }

  @Public()
  @Get('all')
  async getAllWithPages(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.categoryService.findAllWithPages({ page, pageSize });
  }
  
  @Public()
  @Get()
  async getAll() {
    return await this.categoryService.findAll();
  }
  @Get('id')
  async findOne(@Query('id') id: string) {
    return await this.categoryService.findOne(id);
  }
  @Get('name')
  async findByName(@Query('name') name: string) {
    return await this.categoryService.findByname(name);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.categoryService.delete(id);
  }

  @Put('change-status')
  async changeStatus(@Body() body) {
    return await this.categoryService.changeStatus(body.status, body.id);
  }
}
