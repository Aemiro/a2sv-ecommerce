import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MinioService } from '@infrastructure/minio.service';
import { CategoryController } from './controllers/category.controller';
import { CategoryEntity } from './persistence/categories/category.entity';
import { CategoryRepository } from './persistence/categories/category.repository';
import { CategoryCommand } from './usecases/categories/category.usecase.command';
import { CategoryQuery } from './usecases/categories/category.usecase.query';
import { ProductEntity } from './persistence/products/product.entity';
import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './persistence/products/product.repository';
import { ProductCommand } from './usecases/products/product.usecase.command';
import { ProductQuery } from './usecases/products/product.usecase.query';
import { OrderController } from './controllers/order.controller';
import { OrderEntity } from './persistence/orders/order.entity';
import { OrderRepository } from './persistence/orders/order.repository';
import { OrderCommand } from './usecases/orders/order.usecase.command';
import { OrderQuery } from './usecases/orders/order.usecase.query';
import { ProductImageEntity } from './persistence/products/product-image.entity';
import { OrderItemEntity } from './persistence/orders/order-item.entity';

@Module({
  controllers: [CategoryController, ProductController, OrderController],
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      ProductEntity,
      OrderEntity,
      ProductImageEntity,
      OrderItemEntity,
    ]),
  ],
  providers: [
    CategoryRepository,
    CategoryCommand,
    CategoryQuery,
    ProductRepository,
    ProductCommand,
    ProductQuery,
    OrderRepository,
    OrderCommand,
    OrderQuery,
    MinioService,
  ],
})
export class ProductModule {}
