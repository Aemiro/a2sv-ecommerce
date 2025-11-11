import { CommonEntity } from '@libs/common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from '../products/product.entity';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity extends CommonEntity {
  @Column({ name: 'order_id' })
  orderId: string;
  @Column({ name: 'product_id' })
  productId: string;
  @Column({ name: 'remark', type: 'text' })
  remark: string;
  @Column({ type: 'float', default: 0, name: 'price' })
  price: number;
  @Column({ type: 'float', default: 1 })
  quantity: number;
  @ManyToOne(() => OrderEntity, (order) => order.orderItems, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
  @ManyToOne(() => ProductEntity, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
