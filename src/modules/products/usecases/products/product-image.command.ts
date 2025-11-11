import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CurrentUserDto, FileDto } from '@libs/common';
import { ProductImageEntity } from '@products/persistence/products/product-image.entity';

export class CreateProductImageCommand {
  productId: string;
  @ApiProperty()
  @IsNotEmpty()
  isPrimary: boolean;
  @ApiProperty()
  altText: string;
  file: FileDto;
  currentUser?: CurrentUserDto;

  static toEntity(command: CreateProductImageCommand): ProductImageEntity {
    const entity = new ProductImageEntity();
    entity.productId = command.productId;
    entity.isPrimary = command.isPrimary;
    entity.altText = command.altText;
    entity.file = command.file;
    entity.createdBy = command?.currentUser?.id;
    entity.updatedBy = command?.currentUser?.id;
    return entity;
  }
}
export class UpdateProductImageCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  productId: string;
  @ApiProperty()
  @IsNotEmpty()
  isPrimary: boolean;
  @ApiProperty()
  altText: string;
  currentUser?: CurrentUserDto;
}

export class RemoveProductImageCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  productId: string;
  currentUser: CurrentUserDto;
}
