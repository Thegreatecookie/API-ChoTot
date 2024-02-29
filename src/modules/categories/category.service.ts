import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDTO } from 'src/dto/create-category.dto';
import { UpdateCategoryDTO } from 'src/dto/update-category.dto';
import { Category } from 'src/schemas/category.schema';
import { PostService } from '../posts/post.service';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
  ) {}

  async create(category: CreateCategoryDTO) {

    const createdCategory = new this.categoryModel(category);
    return await createdCategory.save();
  }

  async findAllWithPages(query: { page: number; pageSize: number }) {
    const categories = await this.categoryModel
      .find()
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);
    const totalCategory = await this.categoryModel.countDocuments();
    return { categories, totalPage: Math.ceil(totalCategory / query.pageSize) };
  }
async findAll(){
  return await this.categoryModel.find({active:true});
}
  async findByname(name: string) {
    const data = await this.categoryModel.findOne({ slug: name });
    return data;
  }

  async findOne(id: string) {
    return await this.categoryModel.findById(id);
  }
  async update(category: UpdateCategoryDTO) {
    return await this.categoryModel.updateOne(
      { _id: category.categoryID },
      { category },
    );
  }

  async delete(id: string) {
    await this.postService.deleteWithCategory(id);
    return await this.categoryModel.deleteOne({ _id: id });
  }

  async changeStatus(status: boolean, id: string) {
    return await this.categoryModel.updateOne({ _id: id }, { active: !status });
  }
}
