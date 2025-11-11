import { CurrentUserDto } from '@libs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { OrderEntity } from '@products/persistence/orders/order.entity';
import { IsNotEmpty, IsPositive, Min } from 'class-validator';
export class CreateOrderCommand {
  @ApiProperty()
  @IsNotEmpty()
  status: string;
  @ApiProperty()
  @IsNotEmpty()
  description: string;
  userId: string;
  @ApiProperty()
  @IsNotEmpty()
  totalPrice: number;
  @ApiProperty()
  @IsNotEmpty()
  totalItems: number;
  @ApiProperty({ type: () => [AddOrderItemCommand] })
  @IsNotEmpty()
  orderItems?: AddOrderItemCommand[];
  currentUser: CurrentUserDto;

  static toEntity(command: CreateOrderCommand): OrderEntity {
    const entity = new OrderEntity();
    entity.status = command.status;
    entity.description = command.description;
    entity.totalPrice = command.totalPrice;
    entity.totalItems = command.totalItems;
    entity.userId = command.userId ?? command?.currentUser?.id;
    entity.createdBy = command?.currentUser?.id;
    entity.updatedBy = command?.currentUser?.id;
    return entity;
  }
}
export class UpdateOrderCommand extends PartialType(CreateOrderCommand) {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
}
export class ArchiveOrderCommand {
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
export class AddOrderItemCommand {
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
}
