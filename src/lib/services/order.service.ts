/**
 * Order Service - Business Logic Layer
 *
 * Single Responsibility: Contains all business logic related to order management.
 * Uses repository interfaces for data access (Dependency Inversion).
 */

import type {
  IOrderRepository,
  CreateOrderDTO,
  UpdateOrderDTO,
} from '@/lib/repositories';
import { validate, createOrderSchema, updateOrderSchema } from '@/lib/validation';
import type { Order, OrderStatus } from '@/types';

export interface IOrderService {
  // CRUD operations
  getOrder(id: string): Promise<Order | null>;
  getOrderByStripeSession(sessionId: string): Promise<Order | null>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersByDate(pickupDate: string): Promise<Order[]>;
  getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
  getOrdersByDateAndStatus(pickupDate: string, status: OrderStatus): Promise<Order[]>;
  createOrder(data: CreateOrderDTO): Promise<Order>;
  updateOrder(id: string, data: UpdateOrderDTO): Promise<Order>;
  deleteOrder(id: string): Promise<void>;

  // Business operations
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  getUserUpcomingOrders(userId: string): Promise<Order[]>;
  getUserPastOrders(userId: string): Promise<Order[]>;
  getOrderStatistics(pickupDate: string): Promise<OrderStatistics>;
}

export interface OrderStatistics {
  total: number;
  byStatus: Record<OrderStatus, number>;
  totalRevenue: number;
}

const COMPLETED_STATUSES: OrderStatus[] = ['picked_up', 'canceled'];

export class OrderService implements IOrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async getOrder(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async getOrderByStripeSession(sessionId: string): Promise<Order | null> {
    return this.orderRepository.findByStripeSession(sessionId);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll({ orderBy: 'created_at', orderDirection: 'desc' });
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUser(userId);
  }

  async getOrdersByDate(pickupDate: string): Promise<Order[]> {
    return this.orderRepository.findByDate(pickupDate);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }

  async getOrdersByDateAndStatus(pickupDate: string, status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.findByDateAndStatus(pickupDate, status);
  }

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    // Validate input
    const validation = validate(createOrderSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }

    // Check if order with same Stripe session already exists (idempotency)
    if (data.stripe_session_id) {
      const existing = await this.orderRepository.findByStripeSession(data.stripe_session_id);
      if (existing) {
        return existing;
      }
    }

    return this.orderRepository.create(data);
  }

  async updateOrder(id: string, data: UpdateOrderDTO): Promise<Order> {
    // Validate input
    const validation = validate(updateOrderSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }

    // Check order exists
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new Error('Order not found');
    }

    return this.orderRepository.update(id, data);
  }

  async deleteOrder(id: string): Promise<void> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new Error('Order not found');
    }

    // Only allow deletion of canceled orders
    if (existing.status !== 'canceled') {
      throw new Error('Only canceled orders can be deleted');
    }

    return this.orderRepository.delete(id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new Error(`Cannot transition from '${order.status}' to '${status}'`);
    }

    return this.orderRepository.updateStatus(id, status);
  }

  async getUserUpcomingOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderRepository.findByUser(userId);
    return orders.filter((o) => !COMPLETED_STATUSES.includes(o.status));
  }

  async getUserPastOrders(userId: string): Promise<Order[]> {
    const orders = await this.orderRepository.findByUser(userId);
    return orders.filter((o) => COMPLETED_STATUSES.includes(o.status));
  }

  async getOrderStatistics(pickupDate: string): Promise<OrderStatistics> {
    const orders = await this.orderRepository.findByDate(pickupDate);

    const byStatus: Record<OrderStatus, number> = {
      paid: 0,
      prepping: 0,
      ready: 0,
      picked_up: 0,
      canceled: 0,
    };

    let totalRevenue = 0;

    orders.forEach((order) => {
      byStatus[order.status]++;
      if (order.status !== 'canceled') {
        totalRevenue += order.total_amount;
      }
    });

    return {
      total: orders.length,
      byStatus,
      totalRevenue,
    };
  }

  /**
   * Validate order status transitions
   * Follows a logical workflow: paid -> prepping -> ready -> picked_up
   * Can cancel from any non-final state
   */
  private isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      paid: ['prepping', 'canceled'],
      prepping: ['ready', 'canceled'],
      ready: ['picked_up', 'canceled'],
      picked_up: [], // Final state
      canceled: [], // Final state
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}
