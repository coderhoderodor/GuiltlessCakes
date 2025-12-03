/**
 * Inquiry Service - Business Logic Layer
 *
 * Single Responsibility: Contains all business logic related to custom cake inquiries.
 * Uses repository interfaces for data access (Dependency Inversion).
 */

import type {
  IInquiryRepository,
  CreateInquiryDTO,
  UpdateInquiryDTO,
} from '@/lib/repositories';
import { validate, createInquirySchema, updateInquirySchema } from '@/lib/validation';
import type { Inquiry, InquiryImage, InquiryStatus } from '@/types';

export interface IInquiryService {
  // CRUD operations
  getInquiry(id: string): Promise<Inquiry | null>;
  getAllInquiries(): Promise<Inquiry[]>;
  getInquiriesByUser(userId: string): Promise<Inquiry[]>;
  getInquiriesByStatus(status: InquiryStatus): Promise<Inquiry[]>;
  createInquiry(data: CreateInquiryDTO): Promise<Inquiry>;
  updateInquiry(id: string, data: UpdateInquiryDTO): Promise<Inquiry>;
  deleteInquiry(id: string): Promise<void>;

  // Image operations
  addImage(inquiryId: string, imageUrl: string): Promise<InquiryImage>;
  deleteImage(imageId: string): Promise<void>;

  // Business operations
  updateStatus(id: string, status: InquiryStatus): Promise<Inquiry>;
  getInquiryStatistics(): Promise<InquiryStatistics>;
  getNewInquiriesCount(): Promise<number>;
}

export interface InquiryStatistics {
  total: number;
  byStatus: Partial<Record<InquiryStatus, number>>;
  newCount: number;
  pendingReviewCount: number;
}

const ACTIVE_STATUSES: InquiryStatus[] = ['new', 'in_review', 'quoted', 'accepted', 'in_progress', 'ready_for_pickup'];
const CLOSED_STATUSES: InquiryStatus[] = ['completed', 'rejected', 'closed'];

export class InquiryService implements IInquiryService {
  constructor(private readonly inquiryRepository: IInquiryRepository) {}

  async getInquiry(id: string): Promise<Inquiry | null> {
    return this.inquiryRepository.findById(id);
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return this.inquiryRepository.findAll({ orderBy: 'created_at', orderDirection: 'desc' });
  }

  async getInquiriesByUser(userId: string): Promise<Inquiry[]> {
    return this.inquiryRepository.findByUser(userId);
  }

  async getInquiriesByStatus(status: InquiryStatus): Promise<Inquiry[]> {
    return this.inquiryRepository.findByStatus(status);
  }

  async createInquiry(data: CreateInquiryDTO): Promise<Inquiry> {
    // Validate input
    const validation = validate(createInquirySchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }

    // Validate event date is at least 1 month in the future
    const eventDate = new Date(data.event_date);
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() + 1);

    if (eventDate < minDate) {
      throw new Error('Event date must be at least 1 month from today');
    }

    // Limit images to 5
    if (data.image_urls && data.image_urls.length > 5) {
      throw new Error('Maximum 5 images allowed per inquiry');
    }

    return this.inquiryRepository.create(data);
  }

  async updateInquiry(id: string, data: UpdateInquiryDTO): Promise<Inquiry> {
    // Validate input
    const validation = validate(updateInquirySchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }

    // Check inquiry exists
    const existing = await this.inquiryRepository.findById(id);
    if (!existing) {
      throw new Error('Inquiry not found');
    }

    return this.inquiryRepository.update(id, data);
  }

  async deleteInquiry(id: string): Promise<void> {
    const existing = await this.inquiryRepository.findById(id);
    if (!existing) {
      throw new Error('Inquiry not found');
    }

    // Only allow deletion of closed inquiries
    if (!CLOSED_STATUSES.includes(existing.status)) {
      throw new Error('Only closed inquiries can be deleted');
    }

    return this.inquiryRepository.delete(id);
  }

  async addImage(inquiryId: string, imageUrl: string): Promise<InquiryImage> {
    const inquiry = await this.inquiryRepository.findWithImages(inquiryId);
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Check image limit
    if (inquiry.images && inquiry.images.length >= 5) {
      throw new Error('Maximum 5 images allowed per inquiry');
    }

    return this.inquiryRepository.addImage(inquiryId, imageUrl);
  }

  async deleteImage(imageId: string): Promise<void> {
    return this.inquiryRepository.deleteImage(imageId);
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findById(id);
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(inquiry.status, status)) {
      throw new Error(`Cannot transition from '${inquiry.status}' to '${status}'`);
    }

    return this.inquiryRepository.updateStatus(id, status);
  }

  async getInquiryStatistics(): Promise<InquiryStatistics> {
    const inquiries = await this.inquiryRepository.findAll();

    const byStatus: Partial<Record<InquiryStatus, number>> = {};
    let newCount = 0;
    let pendingReviewCount = 0;

    inquiries.forEach((inquiry) => {
      byStatus[inquiry.status] = (byStatus[inquiry.status] || 0) + 1;

      if (inquiry.status === 'new') {
        newCount++;
      }
      if (inquiry.status === 'new' || inquiry.status === 'in_review') {
        pendingReviewCount++;
      }
    });

    return {
      total: inquiries.length,
      byStatus,
      newCount,
      pendingReviewCount,
    };
  }

  async getNewInquiriesCount(): Promise<number> {
    return this.inquiryRepository.count({ filters: { status: 'new' } });
  }

  /**
   * Validate inquiry status transitions
   * Follows a logical workflow for custom cake orders
   */
  private isValidStatusTransition(from: InquiryStatus, to: InquiryStatus): boolean {
    const validTransitions: Record<InquiryStatus, InquiryStatus[]> = {
      new: ['in_review', 'rejected', 'closed'],
      in_review: ['quoted', 'rejected', 'closed'],
      quoted: ['accepted', 'rejected', 'closed'],
      accepted: ['in_progress', 'rejected', 'closed'],
      in_progress: ['ready_for_pickup', 'closed'],
      ready_for_pickup: ['completed', 'closed'],
      completed: [], // Final state
      rejected: [], // Final state
      closed: [], // Final state
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}
