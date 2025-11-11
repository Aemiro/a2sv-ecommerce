import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryResponse } from './category.response';
import {
  CollectionQuery,
  FilterOperators,
  QueryConstructor,
} from '@libs/collection-query';
import { DataResponseFormat } from '@libs/response-format';
import { CurrentUserDto } from '@libs/common';
import { CategoryEntity } from '@products/persistence/categories/category.entity';
@Injectable()
export class CategoryQuery {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}
  async getCategory(
    id: string,
    relations: string[] = [],
    withDeleted = false,
  ): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
    if (!category) {
      throw new NotFoundException(`Category not found with id ${id}`);
    }
    return CategoryResponse.toResponse(category);
  }
  async getCategories(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<CategoryResponse>> {
    const dataQuery = QueryConstructor.constructQuery<CategoryEntity>(
      this.categoryRepository,
      query,
    );
    const d = new DataResponseFormat<CategoryResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => CategoryResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }

  async getArchivedCategories(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<CategoryResponse>> {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'deleted_at',
        operator: FilterOperators.NotNull,
      },
    ]);
    const dataQuery = QueryConstructor.constructQuery<CategoryEntity>(
      this.categoryRepository,
      query,
    );
    dataQuery.withDeleted();
    const d = new DataResponseFormat<CategoryResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => CategoryResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
}
