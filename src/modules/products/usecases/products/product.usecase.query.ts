import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CollectionQuery,
  FilterOperators,
  QueryConstructor,
} from '@libs/collection-query';
import { DataResponseFormat } from '@libs/response-format';
import { CurrentUserDto } from '@libs/common';
import { ProductEntity } from '@products/persistence/products/product.entity';
import { ProductResponse } from './product.response';
@Injectable()
export class ProductQuery {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}
  async getProduct(
    id: string,
    relations: string[] = [],
    withDeleted = false,
  ): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }
    return ProductResponse.toResponse(product);
  }
  async getProducts(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<ProductResponse>> {
    // console.log('getProducts', query, query.filter);
    console.log('getProductsQueryFilter', query.filter);

    const dataQuery = QueryConstructor.constructQuery<ProductEntity>(
      this.productRepository,
      query,
    );
    const d = new DataResponseFormat<ProductResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => ProductResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }

  async getArchivedProducts(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<ProductResponse>> {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'deleted_at',
        operator: FilterOperators.NotNull,
      },
    ]);
    const dataQuery = QueryConstructor.constructQuery<ProductEntity>(
      this.productRepository,
      query,
    );
    dataQuery.withDeleted();
    const d = new DataResponseFormat<ProductResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => ProductResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
}
