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
import { OrderEntity } from '@products/persistence/orders/order.entity';
import { OrderResponse } from './order.response';
@Injectable()
export class OrderQuery {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
  ) {}
  async getOrder(
    id: string,
    relations: string[] = [],
    withDeleted = false,
  ): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
    if (!order) {
      throw new NotFoundException(`Order not found with id ${id}`);
    }
    return OrderResponse.toResponse(order);
  }
  async getOrders(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<OrderResponse>> {
    const dataQuery = QueryConstructor.constructQuery<OrderEntity>(
      this.orderRepository,
      query,
    );
    const d = new DataResponseFormat<OrderResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => OrderResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }

  async getArchivedOrders(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<OrderResponse>> {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'deleted_at',
        operator: FilterOperators.NotNull,
      },
    ]);
    const dataQuery = QueryConstructor.constructQuery<OrderEntity>(
      this.orderRepository,
      query,
    );
    dataQuery.withDeleted();
    const d = new DataResponseFormat<OrderResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => OrderResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
}
