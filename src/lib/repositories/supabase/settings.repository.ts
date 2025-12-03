/**
 * Settings Repository - Supabase Implementation
 *
 * Implements ISettingsRepository with Supabase as the data store.
 * Single Responsibility: Handles only settings data access.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { ISettingsRepository } from '../interfaces';
import type { Settings } from '@/types';

export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.value as T;
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    const { error } = await this.supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      throw new Error(`Failed to set setting '${key}': ${error.message}`);
    }
  }

  async getAll(): Promise<Settings[]> {
    const { data, error } = await this.supabase
      .from('settings')
      .select('*')
      .order('key');

    if (error) throw new Error(`Failed to fetch settings: ${error.message}`);
    return (data || []) as Settings[];
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.supabase.from('settings').delete().eq('key', key);

    if (error) {
      throw new Error(`Failed to delete setting '${key}': ${error.message}`);
    }
  }
}
