/**
 * Services Module - Business Logic Layer
 *
 * Exports all service interfaces and factory functions.
 * Services contain business logic and use repositories for data access.
 *
 * S.O.L.I.D Principles Applied:
 * - Single Responsibility: Each service handles one domain
 * - Open/Closed: Services can be extended without modification
 * - Liskov Substitution: Services implement interfaces, can be substituted
 * - Interface Segregation: Focused interfaces for each service
 * - Dependency Inversion: Services depend on repository interfaces
 */

export * from './menu.service';
export * from './order.service';
export * from './inquiry.service';
export * from './settings.service';

import { SupabaseClient } from '@supabase/supabase-js';
import { createRepositoryContainer, IRepositoryContainer } from '@/lib/repositories';
import { MenuService, IMenuService } from './menu.service';
import { OrderService, IOrderService } from './order.service';
import { InquiryService, IInquiryService } from './inquiry.service';
import { SettingsService, ISettingsService } from './settings.service';

/**
 * Service container for dependency injection
 * Open/Closed Principle: Can be extended with new services without modification
 */
export interface IServiceContainer {
  menu: IMenuService;
  orders: IOrderService;
  inquiries: IInquiryService;
  settings: ISettingsService;
}

/**
 * Create a service container with all services
 * This is the composition root for the service layer
 */
export function createServiceContainer(supabase: SupabaseClient): IServiceContainer {
  const repositories = createRepositoryContainer(supabase);

  return {
    menu: new MenuService(repositories.menuItems),
    orders: new OrderService(repositories.orders),
    inquiries: new InquiryService(repositories.inquiries),
    settings: new SettingsService(repositories.settings),
  };
}

/**
 * Create a service container from an existing repository container
 * Useful when you need to share repositories across multiple service containers
 */
export function createServiceContainerFromRepositories(
  repositories: IRepositoryContainer
): IServiceContainer {
  return {
    menu: new MenuService(repositories.menuItems),
    orders: new OrderService(repositories.orders),
    inquiries: new InquiryService(repositories.inquiries),
    settings: new SettingsService(repositories.settings),
  };
}

/**
 * Factory functions for individual services
 * Use these when you only need a specific service
 */
export function createMenuService(supabase: SupabaseClient): IMenuService {
  const repositories = createRepositoryContainer(supabase);
  return new MenuService(repositories.menuItems);
}

export function createOrderService(supabase: SupabaseClient): IOrderService {
  const repositories = createRepositoryContainer(supabase);
  return new OrderService(repositories.orders);
}

export function createInquiryService(supabase: SupabaseClient): IInquiryService {
  const repositories = createRepositoryContainer(supabase);
  return new InquiryService(repositories.inquiries);
}

export function createSettingsService(supabase: SupabaseClient): ISettingsService {
  const repositories = createRepositoryContainer(supabase);
  return new SettingsService(repositories.settings);
}
