import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDTO } from 'src/dto/create-category.dto';
import { UpdateCategoryDTO } from 'src/dto/update-category.dto';
import { Category } from 'src/schemas/category.schema';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(category: CreateCategoryDTO) {
    const createdCategory = new this.categoryModel(category);
    return await createdCategory.save();
  }
  async find() {
    return await this.categoryModel.find({});
  }
  async update(category: UpdateCategoryDTO) {
    return await this.categoryModel.updateOne(
      { _id: category.categoryID },
      { category },
    );
  }
  async delete(id: string) {
    return await this.categoryModel.deleteOne({ id });
  }
}
