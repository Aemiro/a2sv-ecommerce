import {
  IncludeQuery,
  CollectionQuery,
  FilterOperators,
} from '@libs/collection-query';
import { CurrentUserDto } from '@libs/common';
import {
  DataResponseFormat,
  ApiPaginatedResponse,
} from '@libs/response-format';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateOrderCommand,
  UpdateOrderCommand,
  ArchiveOrderCommand,
} from '../usecases/orders/order.commands';
import { OrderResponse } from '../usecases/orders/order.response';
import { OrderCommand } from '../usecases/orders/order.usecase.command';
import { OrderQuery } from '../usecases/orders/order.usecase.query';
import { MinioService } from '@infrastructure/minio.service';
import { CurrentUser } from '@libs/decorators/current-user.decorator';
import {
  CreateOrderItemCommand,
  UpdateOrderItemCommand,
  RemoveOrderItemCommand,
} from '@products/usecases/orders/order-item.command';
@Controller('orders')
@ApiTags('orders')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiResponse({ status: 404, description: 'Item not found' })
@ApiExtraModels(DataResponseFormat)
export class OrderController {
  constructor(
    private command: OrderCommand,
    private orderQuery: OrderQuery,
    private minioService: MinioService,
  ) {}
  @Get('get-order/:id')
  @ApiOkResponse({ type: OrderResponse })
  async getOrder(@Param('id') id: string, @Query() includeQuery: IncludeQuery) {
    return this.orderQuery.getOrder(id, includeQuery.includes, true);
  }
  @Get('get-archived-order/:id')
  @ApiOkResponse({ type: OrderResponse })
  async getArchivedOrder(
    @Param('id') id: string,
    @Query() includeQuery: IncludeQuery,
  ) {
    return this.orderQuery.getOrder(id, includeQuery.includes, true);
  }
  @Get('get-orders')
  @ApiPaginatedResponse(OrderResponse)
  async getOrders(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.orderQuery.getOrders(query, currentUser);
  }
  @Get('get-my-orders')
  @ApiPaginatedResponse(OrderResponse)
  async getMyOrders(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'user_id',
        operator: FilterOperators.EqualTo,
        value: currentUser?.id,
      },
    ]);
    return this.orderQuery.getOrders(query, currentUser);
  }
  @Post('create-order')
  @ApiOkResponse({ type: OrderResponse })
  async createOrder(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() createOrderCommand: CreateOrderCommand,
  ) {
    createOrderCommand.currentUser = currentUser;
    return this.command.createOrder(createOrderCommand);
  }
  @Put('update-order')
  @ApiOkResponse({ type: OrderResponse })
  async updateOrder(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() updateOrderCommand: UpdateOrderCommand,
  ) {
    updateOrderCommand.currentUser = currentUser;
    return this.command.updateOrder(updateOrderCommand);
  }
  @Delete('archive-order')
  @ApiOkResponse({ type: OrderResponse })
  async archiveOrder(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() archiveCommand: ArchiveOrderCommand,
  ) {
    archiveCommand.currentUser = currentUser;
    return this.command.archiveOrder(archiveCommand);
  }
  @Delete('delete-order/:id')
  @ApiOkResponse({ type: Boolean })
  async deleteOrder(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.deleteOrder(id, currentUser);
  }
  @Post('restore-order/:id')
  @ApiOkResponse({ type: OrderResponse })
  async restoreOrder(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('id') id: string,
  ) {
    return this.command.restoreOrder(id, currentUser);
  }
  @Get('get-archived-orders')
  @ApiPaginatedResponse(OrderResponse)
  async getArchivedOrders(
    @Query() query: CollectionQuery,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.orderQuery.getArchivedOrders(query, currentUser);
  }
  // Order Item
  @Post('add-order-item')
  @ApiOkResponse({ type: OrderResponse })
  async addOrderItem(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: CreateOrderItemCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.addOrderItem(command);
  }
  @Put('update-order-item')
  @ApiOkResponse({ type: OrderResponse })
  async updateOrderItem(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: UpdateOrderItemCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.updateOrderItem(command);
  }
  @Post('remove-order-item')
  @ApiOkResponse({ type: OrderResponse })
  async archiveOrderItem(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() command: RemoveOrderItemCommand,
  ) {
    command.currentUser = currentUser;
    return this.command.removeOrderItem(command);
  }
}
