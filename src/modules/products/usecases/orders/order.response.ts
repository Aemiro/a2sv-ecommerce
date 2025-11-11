import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity } from '@products/persistence/orders/order.entity';
import { UserResponse } from '@users/usecases/users/user.response';
import { OrderItemResponse } from './order-item.response';
export class OrderResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  totalPrice: number;
  @ApiProperty()
  totalItems: number;
  @ApiProperty()
  createdBy?: string;
  @ApiProperty()
  updatedBy?: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt?: Date;
  @ApiProperty()
  deletedBy?: string;
  user?: UserResponse;
  orderItems?: OrderItemResponse[];

  static toResponse(entity: OrderEntity): OrderResponse {
    const response = new OrderResponse();
    response.id = entity.id;
    response.status = entity.status;
    response.description = entity.description;
    response.totalPrice = entity.totalPrice;
    response.totalItems = entity.totalItems;
    response.userId = entity.userId;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    if (entity?.user) {
      response.user = UserResponse.toResponse(entity.user);
    }
    if (entity.orderItems) {
      response.orderItems = entity.orderItems.map((orderItem) =>
        OrderItemResponse.toResponse(orderItem),
      );
    }
    return response;
  }
}
