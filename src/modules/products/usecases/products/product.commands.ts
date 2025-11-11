import { CurrentUserDto } from '@libs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ProductEntity } from '@products/persistence/products/product.entity';
import { IsNotEmpty, IsPositive, Max, Min } from 'class-validator';
export class CreateProductCommand {
  @ApiProperty()
  @IsNotEmpty()
  @Min(3)
  @Max(100)
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  @Min(10)
  description: string;
  @ApiProperty()
  @IsNotEmpty()
  categoryId: string;
  userId: string;
  @ApiProperty()
  @IsNotEmpty()
  @Min(0)
  stock: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  price: number;
  currentUser: CurrentUserDto;

  static toEntity(command: CreateProductCommand): ProductEntity {
    const entity = new ProductEntity();
    entity.name = command.name;
    entity.description = command.description;
    entity.stock = command.stock;
    entity.price = command.price;
    entity.categoryId = command.categoryId;
    entity.userId = command?.currentUser?.id;
    entity.createdBy = command?.currentUser?.id;
    entity.updatedBy = command?.currentUser?.id;
    return entity;
  }
}
export class UpdateProductCommand extends PartialType(CreateProductCommand) {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
}
export class ArchiveProductCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  currentUser: CurrentUserDto;
}
