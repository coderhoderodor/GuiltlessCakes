/**
 * Menu Item Repository - Supabase Implementation
 *
 * Implements IMenuItemRepository with Supabase as the data store.
 * Single Responsibility: Handles only menu item data access.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  IMenuItemRepository,
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
  CreateMenuItemTranslationDTO,
  QueryOptions,
} from '../interfaces';
import type { MenuItem, MenuItemTranslation } from '@/types';

export class MenuItemRepository implements IMenuItemRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<MenuItem | null> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*, translations:menu_item_translations(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as MenuItem;
  }

  async findAll(options?: QueryOptions): Promise<MenuItem[]> {
    let query = this.supabase
      .from('menu_items')
      .select('*, translations:menu_item_translations(*)');

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
    if (error) throw new Error(`Failed to fetch menu items: ${error.message}`);
    return (data || []) as MenuItem[];
  }

  async count(options?: QueryOptions): Promise<number> {
    let query = this.supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;
    if (error) throw new Error(`Failed to count menu items: ${error.message}`);
    return count || 0;
  }

  async create(data: CreateMenuItemDTO): Promise<MenuItem> {
    const { translations, ...menuItemData } = data;

    // Create menu item
    const { data: menuItem, error: menuItemError } = await this.supabase
      .from('menu_items')
      .insert(menuItemData)
      .select()
      .single();

    if (menuItemError) {
      throw new Error(`Failed to create menu item: ${menuItemError.message}`);
    }

    // Create translations
    if (translations.length > 0) {
      const translationRecords = translations.map((t) => ({
        ...t,
        menu_item_id: menuItem.id,
      }));

      const { error: translationError } = await this.supabase
        .from('menu_item_translations')
        .insert(translationRecords);

      if (translationError) {
        // Rollback: delete the menu item
        await this.supabase.from('menu_items').delete().eq('id', menuItem.id);
        throw new Error(`Failed to create translations: ${translationError.message}`);
      }
    }

    return this.findById(menuItem.id) as Promise<MenuItem>;
  }

  async update(id: string, data: UpdateMenuItemDTO): Promise<MenuItem> {
    const { error } = await this.supabase
      .from('menu_items')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update menu item: ${error.message}`);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Menu item not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Translations are deleted via cascade
    const { error } = await this.supabase.from('menu_items').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete menu item: ${error.message}`);
    }
  }

  async findBySlug(slug: string): Promise<MenuItem | null> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*, translations:menu_item_translations(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return data as MenuItem;
  }

  async findActive(): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*, translations:menu_item_translations(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch active menu items: ${error.message}`);
    return (data || []) as MenuItem[];
  }

  async findByCategory(category: string): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*, translations:menu_item_translations(*)')
      .eq('category', category)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch menu items by category: ${error.message}`);
    return (data || []) as MenuItem[];
  }

  async findWithTranslations(id: string): Promise<MenuItem | null> {
    return this.findById(id);
  }

  async addTranslation(
    menuItemId: string,
    translation: CreateMenuItemTranslationDTO
  ): Promise<MenuItemTranslation> {
    const { data, error } = await this.supabase
      .from('menu_item_translations')
      .insert({ ...translation, menu_item_id: menuItemId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add translation: ${error.message}`);
    }
    return data as MenuItemTranslation;
  }

  async updateTranslation(
    id: string,
    data: Partial<CreateMenuItemTranslationDTO>
  ): Promise<MenuItemTranslation> {
    const { data: updated, error } = await this.supabase
      .from('menu_item_translations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update translation: ${error.message}`);
    }
    return updated as MenuItemTranslation;
  }

  async deleteTranslation(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('menu_item_translations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete translation: ${error.message}`);
    }
  }
}
