/**
 * Order Repository - Supabase Implementation
 *
 * Implements IOrderRepository with Supabase as the data store.
 * Single Responsibility: Handles only order data access.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  IOrderRepository,
  CreateOrderDTO,
  UpdateOrderDTO,
  QueryOptions,
} from '../interfaces';
import type { Order, OrderStatus } from '@/types';

export class OrderRepository implements IOrderRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private readonly selectWithRelations = `
    *,
    pickup_window:pickup_windows (*),
    profile:profiles (id, first_name, last_name, phone, preferred_language),
    order_items (
      *,
      menu_item:menu_items (
        id,
        slug,
        base_price,
        image_url,
        translations:menu_item_translations (name, language)
      )
    )
  `;

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.selectWithRelations)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Order;
  }

  async findAll(options?: QueryOptions): Promise<Order[]> {
    let query = this.supabase.from('orders').select(this.selectWithRelations);

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection !== 'desc',
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return (data || []) as Order[];
  }

  async count(options?: QueryOptions): Promise<number> {
    let query = this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;
    if (error) throw new Error(`Failed to count orders: ${error.message}`);
    return count || 0;
  }

  async create(data: CreateOrderDTO): Promise<Order> {
    const { items, ...orderData } = data;

    // Create order
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .insert({ ...orderData, status: 'paid' })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    if (items.length > 0) {
      const orderItems = items.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback: delete the order
        await this.supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
    }

    return this.findById(order.id) as Promise<Order>;
  }

  async update(id: string, data: UpdateOrderDTO): Promise<Order> {
    const { error } = await this.supabase
      .from('orders')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Order not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Order items are deleted via cascade
    const { error } = await this.supabase.from('orders').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  async findByUser(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.selectWithRelations)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user orders: ${error.message}`);
    return (data || []) as Order[];
  }

  async findByDate(pickupDate: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.selectWithRelations)
      .eq('pickup_date', pickupDate)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders by date: ${error.message}`);
    return (data || []) as Order[];
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.selectWithRelations)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders by status: ${error.message}`);
    return (data || []) as Order[];
  }

  async findByDateAndStatus(pickupDate: string, status: OrderStatus): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.selectWithRelations)
      .eq('pickup_date', pickupDate)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return (data || []) as Order[];
  }

  async findByStripeSession(sessionId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.selectWithRelations)
      .eq('stripe_session_id', sessionId)
      .single();

    if (error || !data) return null;
    return data as Order;
  }

  async findWithItems(id: string): Promise<Order | null> {
    return this.findById(id);
  }

  async findByDateWithDetails(pickupDate: string): Promise<Order[]> {
    return this.findByDate(pickupDate);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, { status });
  }

  /**
   * Create an order with items atomically using a stored procedure.
   * This ensures the order and all items are created in a single transaction.
   *
   * @param orderData - Order data (without items)
   * @param items - Array of order items
   * @returns The order ID
   */
  async createWithItemsAtomic(
    orderData: Omit<CreateOrderDTO, 'items'>,
    items: Array<{
      menu_item_id: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('create_order_with_items', {
      p_order_data: orderData,
      p_items: items,
    });

    if (error) {
      throw new Error(`Failed to create order atomically: ${error.message}`);
    }

    return data as string;
  }
}
