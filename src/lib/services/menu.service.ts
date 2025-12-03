/**
 * Menu Service - Business Logic Layer
 *
 * Single Responsibility: Contains all business logic related to menu management.
 * Uses repository interfaces for data access (Dependency Inversion).
 */

import type {
  IMenuItemRepository,
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
  CreateMenuItemTranslationDTO,
} from '@/lib/repositories';
import { validate, createMenuItemSchema, updateMenuItemSchema } from '@/lib/validation';
import type { MenuItem, MenuItemTranslation, MenuItemWithAvailability } from '@/types';

export interface IMenuService {
  // CRUD operations
  getMenuItem(id: string): Promise<MenuItem | null>;
  getMenuItemBySlug(slug: string): Promise<MenuItem | null>;
  getAllMenuItems(): Promise<MenuItem[]>;
  getActiveMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  createMenuItem(data: CreateMenuItemDTO): Promise<MenuItem>;
  updateMenuItem(id: string, data: UpdateMenuItemDTO): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Translation operations
  addTranslation(menuItemId: string, translation: CreateMenuItemTranslationDTO): Promise<MenuItemTranslation>;
  updateTranslation(id: string, data: Partial<CreateMenuItemTranslationDTO>): Promise<MenuItemTranslation>;
  deleteTranslation(id: string): Promise<void>;

  // Business operations
  toggleActive(id: string): Promise<MenuItem>;
}

export class MenuService implements IMenuService {
  constructor(private readonly menuItemRepository: IMenuItemRepository) {}

  async getMenuItem(id: string): Promise<MenuItem | null> {
    return this.menuItemRepository.findById(id);
  }

  async getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
    return this.menuItemRepository.findBySlug(slug);
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return this.menuItemRepository.findAll({ orderBy: 'created_at', orderDirection: 'desc' });
  }

  async getActiveMenuItems(): Promise<MenuItem[]> {
    return this.menuItemRepository.findActive();
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return this.menuItemRepository.findByCategory(category);
  }

  async createMenuItem(data: CreateMenuItemDTO): Promise<MenuItem> {
    // Validate input
    const validation = validate(createMenuItemSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }

    // Check for duplicate slug
    const existing = await this.menuItemRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error(`Menu item with slug '${data.slug}' already exists`);
    }

    return this.menuItemRepository.create(data);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDTO): Promise<MenuItem> {
    // Validate input
    const validation = validate(updateMenuItemSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }

    // Check menu item exists
    const existing = await this.menuItemRepository.findById(id);
    if (!existing) {
      throw new Error('Menu item not found');
    }

    // Check for duplicate slug if changing
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await this.menuItemRepository.findBySlug(data.slug);
      if (duplicate) {
        throw new Error(`Menu item with slug '${data.slug}' already exists`);
      }
    }

    return this.menuItemRepository.update(id, data);
  }

  async deleteMenuItem(id: string): Promise<void> {
    const existing = await this.menuItemRepository.findById(id);
    if (!existing) {
      throw new Error('Menu item not found');
    }

    return this.menuItemRepository.delete(id);
  }

  async addTranslation(
    menuItemId: string,
    translation: CreateMenuItemTranslationDTO
  ): Promise<MenuItemTranslation> {
    const menuItem = await this.menuItemRepository.findById(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    // Check if translation for this language already exists
    if (menuItem.translations?.some((t) => t.language === translation.language)) {
      throw new Error(`Translation for language '${translation.language}' already exists`);
    }

    return this.menuItemRepository.addTranslation(menuItemId, translation);
  }

  async updateTranslation(
    id: string,
    data: Partial<CreateMenuItemTranslationDTO>
  ): Promise<MenuItemTranslation> {
    return this.menuItemRepository.updateTranslation(id, data);
  }

  async deleteTranslation(id: string): Promise<void> {
    return this.menuItemRepository.deleteTranslation(id);
  }

  async toggleActive(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    return this.menuItemRepository.update(id, { active: !menuItem.active });
  }
}
