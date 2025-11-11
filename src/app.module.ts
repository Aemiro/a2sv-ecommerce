import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@users/persistence/users/user.entity';
import { CategoryEntity } from '@products/persistence/categories/category.entity';
import { UserModule } from '@users/user.module';
import { ProductModule } from '@products/product.module';
import { ProductEntity } from '@products/persistence/products/product.entity';
import { OrderEntity } from '@products/persistence/orders/order.entity';
import { UserRoleEntity } from '@users/persistence/users/user-role.entity';
import { RoleEntity } from '@users/persistence/roles/role.entity';
import { ProductImageEntity } from '@products/persistence/products/product-image.entity';
import { MinioService } from '@infrastructure/minio.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_CONTAINER_NAME,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      schema: process.env.DATABASE_SCHEMA,
      port: parseInt('5432'),
      entities: [
        UserEntity,
        CategoryEntity,
        ProductEntity,
        OrderEntity,
        RoleEntity,
        UserRoleEntity,
        ProductImageEntity,
      ],
      // synchronize: true,
      synchronize: process.env.NODE_ENV === 'production' ? false : true,
      // logging: process.env.NODE_ENV === 'production' ? false : true,
      autoLoadEntities: true,
    }),
    UserModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService, MinioService],
})
export class AppModule {}
