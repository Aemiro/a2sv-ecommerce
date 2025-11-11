import { CommonEntity } from '@libs/common';
import { Column, Entity } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends CommonEntity {
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'description', nullable: true, type: 'text' })
  description: string;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
