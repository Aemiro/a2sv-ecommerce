import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { BaseRepository } from '@libs/common';

@Injectable()
export class OrderRepository extends BaseRepository<OrderEntity> {
  constructor(
    @InjectRepository(OrderEntity)
    orderRepository: Repository<OrderEntity>,
  ) {
    super(orderRepository);
  }
}
