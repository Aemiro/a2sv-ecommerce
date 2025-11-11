import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponse } from './user.response';
import {
  CollectionQuery,
  FilterOperators,
  QueryConstructor,
} from '@libs/collection-query';
import { DataResponseFormat } from '@libs/response-format';
import { UserEntity } from '../../persistence/users/user.entity';
import { CurrentUserDto } from '@libs/common';
@Injectable()
export class UserQuery {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  async getUser(
    id: string,
    relations: string[] = [],
    withDeleted = false,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
      withDeleted,
    });
    if (!user) {
      throw new NotFoundException(`User not found with id ${id}`);
    }
    return UserResponse.toResponse(user);
  }
  async getUsers(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<UserResponse>> {
    const dataQuery = QueryConstructor.constructQuery<UserEntity>(
      this.userRepository,
      query,
    );
    const d = new DataResponseFormat<UserResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => UserResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }

  async getArchivedUsers(
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<UserResponse>> {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'deleted_at',
        operator: FilterOperators.NotNull,
      },
    ]);
    const dataQuery = QueryConstructor.constructQuery<UserEntity>(
      this.userRepository,
      query,
    );
    dataQuery.withDeleted();
    const d = new DataResponseFormat<UserResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => UserResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
  async getUsersByRole(
    roleId: string,
    query: CollectionQuery,
    currentUser: CurrentUserDto,
  ): Promise<DataResponseFormat<UserResponse>> {
    const dataQuery = QueryConstructor.constructQuery<UserEntity>(
      this.userRepository,
      query,
    );
    dataQuery.innerJoin('users.userRoles', 'user_roles');
    dataQuery.andWhere('user_roles.role_id = :roleId', { roleId });

    const d = new DataResponseFormat<UserResponse>();
    if (query.count) {
      d.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      d.data = result.map((entity) => UserResponse.toResponse(entity));
      d.count = total;
      d.pageNumber = query.pageNumber;
      d.pageSize = query.pageSize;
    }
    return d;
  }
}
