import { CurrentUserDto } from '@libs/common';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ArchiveCategoryCommand,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from './category.commands';
import { CategoryResponse } from './category.response';
import { CategoryRepository } from '@products/persistence/categories/category.repository';
@Injectable()
export class CategoryCommand {
  constructor(private readonly categoryRepository: CategoryRepository) {}
  async createCategory(
    command: CreateCategoryCommand,
  ): Promise<CategoryResponse> {
    if (
      command.name &&
      (await this.categoryRepository.getOneBy('name', command.name, [], true))
    ) {
      throw new BadRequestException(`Category already exist with this name`);
    }
    const categoryDomain = CreateCategoryCommand.toEntity(command);
    categoryDomain.createdBy = command.currentUser.id;
    categoryDomain.updatedBy = command.currentUser.id;

    const category = await this.categoryRepository.insert(categoryDomain);
    const result = await this.categoryRepository.save(category);
    return CategoryResponse.toResponse(result);
  }
  async updateCategory(
    command: UpdateCategoryCommand,
  ): Promise<CategoryResponse> {
    const categoryDomain = await this.categoryRepository.getById(command.id);
    if (!categoryDomain) {
      throw new NotFoundException(`category not found with id ${command.id}`);
    }
    if (categoryDomain.name !== command.name) {
      const category = await this.categoryRepository.getOneBy(
        'name',
        command.name,
        [],
        true,
      );
      if (category) {
        throw new BadRequestException(`category already exist with this name`);
      }
    }
    categoryDomain.description =
      command?.description ?? categoryDomain.description;
    categoryDomain.name = command.name ?? categoryDomain.name;
    categoryDomain.isActive = command.isActive;
    categoryDomain.updatedBy = command?.currentUser?.id;
    const category = await this.categoryRepository.save(categoryDomain);
    return CategoryResponse.toResponse(category);
  }
  async archiveCategory(
    command: ArchiveCategoryCommand,
  ): Promise<CategoryResponse> {
    const categoryDomain = await this.categoryRepository.getById(command.id);
    if (!categoryDomain) {
      throw new NotFoundException(`category not found with id ${command.id}`);
    }
    categoryDomain.deletedAt = new Date();
    categoryDomain.deletedBy = command.currentUser.id;
    const result = await this.categoryRepository.save(categoryDomain);

    return CategoryResponse.toResponse(result);
  }
  async restoreCategory(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<CategoryResponse> {
    const categoryDomain = await this.categoryRepository.getById(id, [], true);
    if (!categoryDomain) {
      throw new NotFoundException(`category not found with id ${id}`);
    }
    await this.categoryRepository.restore(id);
    categoryDomain.deletedAt = undefined;
    return CategoryResponse.toResponse(categoryDomain);
  }
  async deleteCategory(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<boolean> {
    const categoryDomain = await this.categoryRepository.getById(id, [], true);
    if (!categoryDomain) {
      throw new NotFoundException(`Category not found with id ${id}`);
    }
    const result = await this.categoryRepository.delete(id);
    return result;
  }
}
