import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleResponse } from './role.response';
import {
  CollectionQuery,
  QueryConstructor,
  FilterOperators,
} from '@libs/collection-query';
import { DataResponseFormat } from '@libs/response-format';
import { RoleEntity } from '../../persistence/roles/role.entity';
import { CurrentUserDto } from '@libs/common';
@Injectable()
export class RoleQuery {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}
  async getRole(
    id: string,
    relations: string[] = [],
    withDeleted = false,
  ): Promise<RoleResponse> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
    if (!role) {
      throw new NotFoundException(`Role not found with id ${id}`);
    }
    return RoleResponse.toResponse(role);
  }
  async getRoles(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<RoleResponse>> {
    const dataQuery = QueryConstructor.constructQuery<RoleEntity>(
      this.roleRepository,
      query,
    );
    const d = new DataResponseFormat<RoleResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => RoleResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
  async getArchivedRoles(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<RoleResponse>> {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'deleted_at',
        operator: FilterOperators.NotNull,
      },
    ]);
    const dataQuery = QueryConstructor.constructQuery<RoleEntity>(
      this.roleRepository,
      query,
    );
    dataQuery.withDeleted();
    const d = new DataResponseFormat<RoleResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => RoleResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
}
