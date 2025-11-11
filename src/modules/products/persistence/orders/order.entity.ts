import { CommonEntity } from '@libs/common';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '@users/persistence/users/user.entity';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity extends CommonEntity {
  @Column({ name: 'description', type: 'text' })
  description: string;
  @Column({ type: 'float', default: 0, name: 'total_price' })
  totalPrice: number;
  @Column({ type: 'float', default: 0, name: 'total_items' })
  totalItems: number;
  @Column({ name: 'user_id' })
  userId: string;
  @Column({ name: 'status', default: 'pending' })
  status: string;
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  orderItems: OrderItemEntity[];
  addOrderItem(orderItem: OrderItemEntity) {
    this.orderItems.push(orderItem);
  }
  updateOrderItem(orderItem: OrderItemEntity) {
    const existIndex = this.orderItems.findIndex(
      (element) => element.id === orderItem.id,
    );
    this.orderItems[existIndex] = orderItem;
  }
  removeOrderItem(id: string) {
    this.orderItems = this.orderItems.filter((element) => element.id !== id);
  }
  updateOrderItems(orderItems: OrderItemEntity[]) {
    this.orderItems = orderItems;
  }
}
