import { CommonEntity } from '@libs/common';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CategoryEntity } from '../categories/category.entity';
import { UserEntity } from '@users/persistence/users/user.entity';
import { ProductImageEntity } from './product-image.entity';

@Entity('products')
export class ProductEntity extends CommonEntity {
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'description', type: 'text' })
  description: string;
  @Column({ type: 'float', default: 0 })
  price: number;
  @Column({ type: 'float', default: 0 })
  stock: number;
  @Column({ name: 'category_id' })
  categoryId: string;
  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @OneToMany(() => ProductImageEntity, (productImage) => productImage.product, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  productImages: ProductImageEntity[];
  addProductImage(productImage: ProductImageEntity) {
    this.productImages.push(productImage);
  }
  updateProductImage(productImage: ProductImageEntity) {
    const existIndex = this.productImages.findIndex(
      (element) => element.id === productImage.id,
    );
    this.productImages[existIndex] = productImage;
  }
  removeProductImage(id: string) {
    this.productImages = this.productImages.filter(
      (element) => element.id !== id,
    );
  }
  updateProductImages(productImages: ProductImageEntity[]) {
    this.productImages = productImages;
  }
}
