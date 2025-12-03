/**
 * Repository Module - Dependency Inversion Principle
 *
 * Exports repository interfaces and factory functions for creating
 * repository instances. This allows the application to depend on
 * abstractions rather than concrete implementations.
 */

export * from './interfaces';

// Re-export Supabase implementations (can be swapped for different implementations)
export * from './supabase';

import { SupabaseClient } from '@supabase/supabase-js';
import {
  MenuItemRepository,
  OrderRepository,
  InquiryRepository,
  SettingsRepository,
} from './supabase';
import type {
  IMenuItemRepository,
  IOrderRepository,
  IInquiryRepository,
  ISettingsRepository,
} from './interfaces';

/**
 * Repository container for dependency injection
 * Open/Closed Principle: Can be extended with new repositories without modification
 */
export interface IRepositoryContainer {
  menuItems: IMenuItemRepository;
  orders: IOrderRepository;
  inquiries: IInquiryRepository;
  settings: ISettingsRepository;
}

/**
 * Create a repository container with Supabase implementations
 * This is the composition root for dependency injection
 */
export function createRepositoryContainer(supabase: SupabaseClient): IRepositoryContainer {
  return {
    menuItems: new MenuItemRepository(supabase),
    orders: new OrderRepository(supabase),
    inquiries: new InquiryRepository(supabase),
    settings: new SettingsRepository(supabase),
  };
}

/**
 * Factory functions for individual repositories
 * Use these when you only need a specific repository
 */
export function createMenuItemRepository(supabase: SupabaseClient): IMenuItemRepository {
  return new MenuItemRepository(supabase);
}

export function createOrderRepository(supabase: SupabaseClient): IOrderRepository {
  return new OrderRepository(supabase);
}

export function createInquiryRepository(supabase: SupabaseClient): IInquiryRepository {
  return new InquiryRepository(supabase);
}

export function createSettingsRepository(supabase: SupabaseClient): ISettingsRepository {
  return new SettingsRepository(supabase);
}
