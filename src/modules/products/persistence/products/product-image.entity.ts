import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CommonEntity, FileDto } from '@libs/common';

@Entity('product_images')
export class ProductImageEntity extends CommonEntity {
  @Column({ name: 'product_id' })
  productId: string;
  @Column({ nullable: true, name: 'alt_text' })
  altText?: string;
  @Column({ type: 'jsonb' })
  file: FileDto;
  @Column({ nullable: true, name: 'is_primary', default: false })
  isPrimary?: boolean;
  @ManyToOne(() => ProductEntity, (product) => product.productImages, {
    orphanedRowAction: 'delete',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
