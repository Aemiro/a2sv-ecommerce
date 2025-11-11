import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive, Min } from 'class-validator';
import { CurrentUserDto } from '@libs/common';
import { OrderItemEntity } from '@products/persistence/orders/order-item.entity';

export class CreateOrderItemCommand {
  @ApiProperty()
  @IsNotEmpty()
  orderId: string;
  @ApiProperty()
  @IsNotEmpty()
  productId: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  price: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  quantity: number;
  @ApiProperty()
  remark: string;
  currentUser?: CurrentUserDto;

  static toEntity(command: CreateOrderItemCommand): OrderItemEntity {
    const entity = new OrderItemEntity();
    entity.productId = command.productId;
    entity.orderId = command.orderId;
    entity.remark = command.remark;
    entity.price = command.price;
    entity.quantity = command.quantity;
    entity.createdBy = command?.currentUser?.id;
    entity.updatedBy = command?.currentUser?.id;
    return entity;
  }
}
export class UpdateOrderItemCommand extends CreateOrderItemCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
}

export class RemoveOrderItemCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  orderId: string;
  currentUser: CurrentUserDto;
}
