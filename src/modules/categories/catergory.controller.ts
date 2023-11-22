import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  Query,
  Delete,
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

  @Roles(Role.Admin)
  @Post('create')
  async create(@Request() req, @Body() createCategory: CreateCategoryDTO) {
    return await this.categoryService.create(createCategory);
  }

  @Roles(Role.Admin)
  @Put('update')
  async update(@Body() updatePost: UpdateCategoryDTO) {
    return await this.categoryService.update(updatePost);
  }

  @Roles(Role.Admin)
  @Get()
  async getByCategory() {
    return await this.categoryService.find();
  }

  @Roles(Role.Admin)
  @Delete('delete')
  async delete(id:string) {
    return await this.categoryService.delete(id);
  }
}
