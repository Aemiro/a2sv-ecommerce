import { CurrentUserDto } from '@libs/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArchiveOrderCommand,
  CreateOrderCommand,
  UpdateOrderCommand,
} from './order.commands';
import { OrderRepository } from '@products/persistence/orders/order.repository';
import { OrderResponse } from './order.response';
import {
  CreateOrderItemCommand,
  UpdateOrderItemCommand,
  RemoveOrderItemCommand,
} from './order-item.command';
import { OrderItemEntity } from '@products/persistence/orders/order-item.entity';
import { ProductEntity } from '@products/persistence/products/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class OrderCommand {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}
  async createOrder(command: CreateOrderCommand): Promise<OrderResponse> {
    const orderDomain = CreateOrderCommand.toEntity(command);
    orderDomain.createdBy = command?.currentUser?.id;
    orderDomain.updatedBy = command?.currentUser?.id;

    const insertedOrder = await this.orderRepository.insert(orderDomain);
    const orderItems = command.orderItems;
    insertedOrder.totalItems = 0;
    insertedOrder.totalPrice = 0;
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        // Load product and validate availability
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          );
        }
        const orderItem = new OrderItemEntity();
        orderItem.orderId = insertedOrder.id;
        orderItem.productId = item.productId;
        orderItem.price = item.price;
        orderItem.quantity = item.quantity;
        orderItem.remark = item.remark;
        orderItem.createdBy = command?.currentUser?.id;
        orderItem.updatedBy = command?.currentUser?.id;
        insertedOrder.totalItems += orderItem.quantity;
        insertedOrder.totalItems += orderItem.quantity * orderItem.price;
        insertedOrder.addOrderItem(orderItem);
        // Decrease product stock
        product.stock -= item.quantity;
        await this.productRepository.save(product);
      }
    }
    const result = await this.orderRepository.save(insertedOrder);
    return OrderResponse.toResponse(result);
  }
  async updateOrder(command: UpdateOrderCommand): Promise<OrderResponse> {
    const orderDomain = await this.orderRepository.getById(command.id);
    if (!orderDomain) {
      throw new NotFoundException(`order not found with id ${command.id}`);
    }
    orderDomain.description = command?.description ?? orderDomain.description;
    orderDomain.status = command.status ?? orderDomain.status;
    orderDomain.updatedBy = command?.currentUser?.id;
    const order = await this.orderRepository.save(orderDomain);
    return OrderResponse.toResponse(order);
  }
  async archiveOrder(command: ArchiveOrderCommand): Promise<OrderResponse> {
    const orderDomain = await this.orderRepository.getById(command.id);
    if (!orderDomain) {
      throw new NotFoundException(`order not found with id ${command.id}`);
    }
    orderDomain.deletedAt = new Date();
    orderDomain.deletedBy = command.currentUser.id;
    const result = await this.orderRepository.save(orderDomain);

    return OrderResponse.toResponse(result);
  }
  async restoreOrder(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<OrderResponse> {
    const orderDomain = await this.orderRepository.getById(id, [], true);
    if (!orderDomain) {
      throw new NotFoundException(`order not found with id ${id}`);
    }
    await this.orderRepository.restore(id);
    orderDomain.deletedAt = undefined;
    return OrderResponse.toResponse(orderDomain);
  }
  async deleteOrder(id: string, currentUser: CurrentUserDto): Promise<boolean> {
    const orderDomain = await this.orderRepository.getById(id, [], true);
    if (!orderDomain) {
      throw new NotFoundException(`Order not found with id ${id}`);
    }
    const result = await this.orderRepository.delete(id);
    return result;
  }
  // orderItems
  async addOrderItem(payload: CreateOrderItemCommand) {
    const order = await this.orderRepository.getById(
      payload.orderId,
      ['orderItems'],
      true,
    );
    if (!order) throw new NotFoundException('Order not found');
    // Load product and validate availability
    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${payload.productId} not found`,
      );
    }

    if (product.stock < payload.quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${payload.quantity}`,
      );
    }
    const orderItemEntity = CreateOrderItemCommand.toEntity(payload);
    order.addOrderItem(orderItemEntity);
    order.totalItems = order.orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    order.totalPrice = order.orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const updatedOrder = await this.orderRepository.save(order);
    // Decrease product stock
    product.stock -= payload.quantity;
    await this.productRepository.save(product);
    return OrderResponse.toResponse(updatedOrder);
  }
  async updateOrderItem(payload: UpdateOrderItemCommand) {
    const order = await this.orderRepository.getById(
      payload.orderId,
      ['orderItems', 'orderItems.product'],
      true,
    );
    if (!order) throw new NotFoundException('Order not found');
    let orderItem = order.orderItems.find(
      (orderItem) => orderItem.id === payload.id,
    );
    if (!orderItem) throw new NotFoundException('Item not found');
    const oldOrderItem = { ...orderItem };
    orderItem = { ...orderItem, ...payload };
    orderItem.updatedBy = payload?.currentUser?.id;
    order.updateOrderItem(orderItem);
    order.totalItems = order.orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    order.totalPrice = order.orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    // ✅ Update product stock if quantity changed
    const previousQuantity = oldOrderItem.quantity;
    const newQuantity = payload.quantity ?? previousQuantity;
    if (newQuantity !== previousQuantity) {
      const product = orderItem.product;
      if (!product) throw new NotFoundException('Product not found');

      const quantityDifference = newQuantity - previousQuantity;

      // If user increased order quantity → reduce stock
      // If user decreased order quantity → increase stock
      product.stock -= quantityDifference;

      if (product.stock < 0)
        throw new BadRequestException('Insufficient stock for product');

      await this.productRepository.save(product);
    }
    const updatedOrder = await this.orderRepository.save(order);
    return OrderResponse.toResponse(updatedOrder);
  }
  async removeOrderItem(payload: RemoveOrderItemCommand) {
    const order = await this.orderRepository.getById(
      payload.orderId,
      ['orderItems'],
      true,
    );
    if (!order) throw new NotFoundException('Order not found');
    const orderItem = order.orderItems.find(
      (orderItem) => orderItem.id === payload.id,
    );
    if (!orderItem) throw new NotFoundException('Item not found');
    order.removeOrderItem(orderItem.id);
    order.totalItems -= orderItem.quantity;
    order.totalPrice -= orderItem.quantity * orderItem.price;
    // Load product and validate availability
    const product = await this.productRepository.findOne({
      where: { id: orderItem.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${orderItem.productId} not found`,
      );
    }
    // Increase product stock
    product.stock += orderItem.quantity;
    await this.productRepository.save(product);
    const result = await this.orderRepository.save(order);
    return OrderResponse.toResponse(result);
  }
}
