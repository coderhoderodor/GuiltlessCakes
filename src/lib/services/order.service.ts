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
  CreateOrderItemDTO,
} from '@/lib/repositories';
import { validate, createOrderSchema, updateOrderSchema } from '@/lib/validation';
import type { Order, OrderStatus } from '@/types';
import type Stripe from 'stripe';

/**
 * Metadata stored in Stripe checkout session for order creation.
 */
export interface StripeOrderMetadata {
  user_id: string;
  pickup_date: string;
  pickup_window: string; // This is the window ID
  items: string; // JSON stringified array of { menu_item_id, quantity }
}

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

  /**
   * Create an order from a completed Stripe checkout session.
   * Handles idempotency, item price lookup, and atomic creation.
   */
  createOrderFromStripeSession(
    session: Stripe.Checkout.Session,
    getMenuItemPrice: (menuItemId: string) => Promise<number>
  ): Promise<Order>;
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

  /**
   * Create an order from a completed Stripe checkout session.
   *
   * This method:
   * 1. Checks for existing order (idempotency)
   * 2. Extracts metadata from the Stripe session
   * 3. Calculates prices for each item
   * 4. Creates the order and items atomically using stored procedure
   */
  async createOrderFromStripeSession(
    session: Stripe.Checkout.Session,
    getMenuItemPrice: (menuItemId: string) => Promise<number>
  ): Promise<Order> {
    // Idempotency check - return existing order if already created
    const existing = await this.orderRepository.findByStripeSession(session.id);
    if (existing) {
      return existing;
    }

    const metadata = session.metadata as unknown as StripeOrderMetadata;
    if (!metadata?.user_id || !metadata?.pickup_date || !metadata?.pickup_window) {
      throw new Error('Invalid session metadata: missing required fields');
    }

    // Parse items from metadata
    const items: Array<{ menu_item_id: string; quantity: number }> = JSON.parse(
      metadata.items || '[]'
    );

    if (items.length === 0) {
      throw new Error('No items found in session metadata');
    }

    // Calculate amounts from Stripe session
    const total = (session.amount_total || 0) / 100;
    const tax = (session.total_details?.amount_tax || 0) / 100;
    const subtotalWithFee = (session.amount_subtotal || 0) / 100;

    // Service fee is 5% of subtotal
    const serviceFee = subtotalWithFee * 0.05;
    const subtotal = subtotalWithFee - serviceFee;

    // Build order items with prices
    const orderItems: CreateOrderItemDTO[] = [];
    for (const item of items) {
      const price = await getMenuItemPrice(item.menu_item_id);
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: price,
        line_total: price * item.quantity,
      });
    }

    // Create order atomically using stored procedure
    const orderId = await this.orderRepository.createWithItemsAtomic(
      {
        user_id: metadata.user_id,
        pickup_date: metadata.pickup_date,
        pickup_window_id: metadata.pickup_window,
        subtotal_amount: subtotal,
        service_fee_amount: serviceFee,
        tax_amount: tax,
        total_amount: total,
        stripe_session_id: session.id,
      },
      orderItems
    );

    // Fetch and return the complete order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found after creation');
    }

    return order;
  }
}
