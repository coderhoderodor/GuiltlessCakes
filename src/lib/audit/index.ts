/**
 * Audit Logging Module
 *
 * Provides audit trail functionality for tracking admin actions,
 * order changes, and other important events in the system.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Audit action types
export enum AuditAction {
  // Menu items
  MENU_ITEM_CREATED = 'menu_item.created',
  MENU_ITEM_UPDATED = 'menu_item.updated',
  MENU_ITEM_DELETED = 'menu_item.deleted',

  // Orders
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_STATUS_CHANGED = 'order.status_changed',
  ORDER_DELETED = 'order.deleted',

  // Inquiries
  INQUIRY_CREATED = 'inquiry.created',
  INQUIRY_UPDATED = 'inquiry.updated',
  INQUIRY_STATUS_CHANGED = 'inquiry.status_changed',
  INQUIRY_DELETED = 'inquiry.deleted',

  // Quotes
  QUOTE_CREATED = 'quote.created',
  QUOTE_UPDATED = 'quote.updated',
  QUOTE_SENT = 'quote.sent',

  // Settings
  SETTINGS_UPDATED = 'settings.updated',

  // Auth
  ADMIN_LOGIN = 'auth.admin_login',
  ADMIN_LOGOUT = 'auth.admin_logout',
}

// Resource types for audit logs
export type AuditResource =
  | 'menu_item'
  | 'order'
  | 'inquiry'
  | 'quote'
  | 'settings'
  | 'user';

// Audit log entry interface
export interface AuditLogEntry {
  id?: string;
  user_id: string;
  action: AuditAction;
  resource_type: AuditResource;
  resource_id?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

/**
 * Audit Logger class for recording audit events
 */
export class AuditLogger {
  private supabase: SupabaseClient;
  private userId: string;
  private ipAddress?: string;
  private userAgent?: string;

  constructor(
    supabase: SupabaseClient,
    userId: string,
    options?: { ipAddress?: string; userAgent?: string }
  ) {
    this.supabase = supabase;
    this.userId = userId;
    this.ipAddress = options?.ipAddress;
    this.userAgent = options?.userAgent;
  }

  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    resourceType: AuditResource,
    options?: {
      resourceId?: string;
      changes?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const entry: AuditLogEntry = {
      user_id: this.userId,
      action,
      resource_type: resourceType,
      resource_id: options?.resourceId,
      changes: options?.changes,
      metadata: options?.metadata,
      ip_address: this.ipAddress,
      user_agent: this.userAgent,
    };

    try {
      const { error } = await this.supabase.from('audit_logs').insert(entry);

      if (error) {
        // Log to console but don't throw - audit should not break main flow
        console.error('Failed to write audit log:', error);
      }
    } catch (err) {
      console.error('Audit logging error:', err);
    }
  }

  /**
   * Log a menu item action
   */
  async logMenuItemAction(
    action: AuditAction.MENU_ITEM_CREATED | AuditAction.MENU_ITEM_UPDATED | AuditAction.MENU_ITEM_DELETED,
    menuItemId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    return this.log(action, 'menu_item', {
      resourceId: menuItemId,
      changes,
    });
  }

  /**
   * Log an order action
   */
  async logOrderAction(
    action: AuditAction.ORDER_CREATED | AuditAction.ORDER_UPDATED | AuditAction.ORDER_STATUS_CHANGED | AuditAction.ORDER_DELETED,
    orderId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    return this.log(action, 'order', {
      resourceId: orderId,
      changes,
    });
  }

  /**
   * Log an inquiry action
   */
  async logInquiryAction(
    action: AuditAction.INQUIRY_CREATED | AuditAction.INQUIRY_UPDATED | AuditAction.INQUIRY_STATUS_CHANGED | AuditAction.INQUIRY_DELETED,
    inquiryId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    return this.log(action, 'inquiry', {
      resourceId: inquiryId,
      changes,
    });
  }

  /**
   * Log a settings update
   */
  async logSettingsUpdate(changes: Record<string, unknown>): Promise<void> {
    return this.log(AuditAction.SETTINGS_UPDATED, 'settings', {
      changes,
    });
  }
}

/**
 * Create an audit logger instance
 */
export function createAuditLogger(
  supabase: SupabaseClient,
  userId: string,
  request?: Request
): AuditLogger {
  const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0] ||
    request?.headers.get('x-real-ip') ||
    undefined;
  const userAgent = request?.headers.get('user-agent') || undefined;

  return new AuditLogger(supabase, userId, { ipAddress, userAgent });
}

/**
 * Calculate changes between old and new objects
 */
export function calculateChanges(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  for (const key of Object.keys(newObj)) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key],
      };
    }
  }

  return changes;
}
