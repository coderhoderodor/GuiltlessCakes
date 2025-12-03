/**
 * Inquiry Repository - Supabase Implementation
 *
 * Implements IInquiryRepository with Supabase as the data store.
 * Single Responsibility: Handles only inquiry data access.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  IInquiryRepository,
  CreateInquiryDTO,
  UpdateInquiryDTO,
  QueryOptions,
} from '../interfaces';
import type { Inquiry, InquiryImage, InquiryStatus } from '@/types';

export class InquiryRepository implements IInquiryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private readonly selectWithRelations = `
    *,
    profile:profiles (id, first_name, last_name, phone, preferred_language),
    images:inquiry_images (*),
    quotes (*)
  `;

  async findById(id: string): Promise<Inquiry | null> {
    const { data, error } = await this.supabase
      .from('inquiries')
      .select(this.selectWithRelations)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Inquiry;
  }

  async findAll(options?: QueryOptions): Promise<Inquiry[]> {
    let query = this.supabase.from('inquiries').select(this.selectWithRelations);

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
    if (error) throw new Error(`Failed to fetch inquiries: ${error.message}`);
    return (data || []) as Inquiry[];
  }

  async count(options?: QueryOptions): Promise<number> {
    let query = this.supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;
    if (error) throw new Error(`Failed to count inquiries: ${error.message}`);
    return count || 0;
  }

  async create(data: CreateInquiryDTO): Promise<Inquiry> {
    const { image_urls, ...inquiryData } = data;

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await this.supabase
      .from('inquiries')
      .insert({ ...inquiryData, status: 'new' })
      .select()
      .single();

    if (inquiryError) {
      throw new Error(`Failed to create inquiry: ${inquiryError.message}`);
    }

    // Create inquiry images
    if (image_urls && image_urls.length > 0) {
      const images = image_urls.map((url) => ({
        inquiry_id: inquiry.id,
        image_url: url,
      }));

      const { error: imagesError } = await this.supabase
        .from('inquiry_images')
        .insert(images);

      if (imagesError) {
        // Rollback: delete the inquiry
        await this.supabase.from('inquiries').delete().eq('id', inquiry.id);
        throw new Error(`Failed to create inquiry images: ${imagesError.message}`);
      }
    }

    return this.findById(inquiry.id) as Promise<Inquiry>;
  }

  async update(id: string, data: UpdateInquiryDTO): Promise<Inquiry> {
    const { error } = await this.supabase
      .from('inquiries')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update inquiry: ${error.message}`);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Inquiry not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Images and quotes are deleted via cascade
    const { error } = await this.supabase.from('inquiries').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete inquiry: ${error.message}`);
    }
  }

  async findByUser(userId: string): Promise<Inquiry[]> {
    const { data, error } = await this.supabase
      .from('inquiries')
      .select(this.selectWithRelations)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user inquiries: ${error.message}`);
    return (data || []) as Inquiry[];
  }

  async findByStatus(status: InquiryStatus): Promise<Inquiry[]> {
    const { data, error } = await this.supabase
      .from('inquiries')
      .select(this.selectWithRelations)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch inquiries by status: ${error.message}`);
    return (data || []) as Inquiry[];
  }

  async findWithImages(id: string): Promise<Inquiry | null> {
    return this.findById(id);
  }

  async findWithQuotes(id: string): Promise<Inquiry | null> {
    return this.findById(id);
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    return this.update(id, { status });
  }

  async addImage(inquiryId: string, imageUrl: string): Promise<InquiryImage> {
    const { data, error } = await this.supabase
      .from('inquiry_images')
      .insert({ inquiry_id: inquiryId, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add inquiry image: ${error.message}`);
    }
    return data as InquiryImage;
  }

  async deleteImage(imageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('inquiry_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      throw new Error(`Failed to delete inquiry image: ${error.message}`);
    }
  }
}
