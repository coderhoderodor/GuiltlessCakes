/**
 * Settings Service - Business Logic Layer
 *
 * Single Responsibility: Contains all business logic related to application settings.
 * Uses repository interfaces for data access (Dependency Inversion).
 */

import type { ISettingsRepository } from '@/lib/repositories';
import {
  validate,
  serviceFeeSettingSchema,
  orderingEnabledSettingSchema,
  maxWeeklyOrdersSettingSchema,
  pickupInstructionsSettingSchema,
  businessInfoSettingSchema,
} from '@/lib/validation';

// Setting keys as constants (Open/Closed Principle - can add new keys without modification)
export const SETTING_KEYS = {
  SERVICE_FEE_RATE: 'service_fee_rate',
  ORDERING_ENABLED: 'ordering_enabled',
  MAX_WEEKLY_ORDERS: 'max_weekly_orders',
  PICKUP_INSTRUCTIONS: 'pickup_instructions',
  BUSINESS_INFO: 'business_info',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

// Type-safe setting value types
export interface ServiceFeeSetting {
  rate: number;
}

export interface OrderingEnabledSetting {
  enabled: boolean;
}

export interface MaxWeeklyOrdersSetting {
  limit: number;
}

export interface PickupInstructionsSetting {
  en: string;
  es: string;
  pt: string;
}

export interface BusinessInfoSetting {
  name: string;
  address: string;
  phone: string;
  email: string;
}

// Combined settings interface for bulk operations
export interface AllSettings {
  serviceFeeRate: ServiceFeeSetting | null;
  orderingEnabled: OrderingEnabledSetting | null;
  maxWeeklyOrders: MaxWeeklyOrdersSetting | null;
  pickupInstructions: PickupInstructionsSetting | null;
  businessInfo: BusinessInfoSetting | null;
}

export interface ISettingsService {
  // Individual setting operations
  getServiceFeeRate(): Promise<ServiceFeeSetting | null>;
  setServiceFeeRate(value: ServiceFeeSetting): Promise<void>;

  getOrderingEnabled(): Promise<OrderingEnabledSetting | null>;
  setOrderingEnabled(value: OrderingEnabledSetting): Promise<void>;

  getMaxWeeklyOrders(): Promise<MaxWeeklyOrdersSetting | null>;
  setMaxWeeklyOrders(value: MaxWeeklyOrdersSetting): Promise<void>;

  getPickupInstructions(): Promise<PickupInstructionsSetting | null>;
  setPickupInstructions(value: PickupInstructionsSetting): Promise<void>;

  getBusinessInfo(): Promise<BusinessInfoSetting | null>;
  setBusinessInfo(value: BusinessInfoSetting): Promise<void>;

  // Bulk operations
  getAllSettings(): Promise<AllSettings>;
  updateAllSettings(settings: Partial<AllSettings>): Promise<void>;

  // Business operations
  isOrderingOpen(): Promise<boolean>;
  calculateServiceFee(subtotal: number): Promise<number>;
}

export class SettingsService implements ISettingsService {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  // Service Fee Rate
  async getServiceFeeRate(): Promise<ServiceFeeSetting | null> {
    return this.settingsRepository.get<ServiceFeeSetting>(SETTING_KEYS.SERVICE_FEE_RATE);
  }

  async setServiceFeeRate(value: ServiceFeeSetting): Promise<void> {
    const validation = validate(serviceFeeSettingSchema, value);
    if (!validation.success) {
      throw new Error(`Invalid service fee rate: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }
    await this.settingsRepository.set(SETTING_KEYS.SERVICE_FEE_RATE, value);
  }

  // Ordering Enabled
  async getOrderingEnabled(): Promise<OrderingEnabledSetting | null> {
    return this.settingsRepository.get<OrderingEnabledSetting>(SETTING_KEYS.ORDERING_ENABLED);
  }

  async setOrderingEnabled(value: OrderingEnabledSetting): Promise<void> {
    const validation = validate(orderingEnabledSettingSchema, value);
    if (!validation.success) {
      throw new Error(`Invalid ordering enabled setting: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }
    await this.settingsRepository.set(SETTING_KEYS.ORDERING_ENABLED, value);
  }

  // Max Weekly Orders
  async getMaxWeeklyOrders(): Promise<MaxWeeklyOrdersSetting | null> {
    return this.settingsRepository.get<MaxWeeklyOrdersSetting>(SETTING_KEYS.MAX_WEEKLY_ORDERS);
  }

  async setMaxWeeklyOrders(value: MaxWeeklyOrdersSetting): Promise<void> {
    const validation = validate(maxWeeklyOrdersSettingSchema, value);
    if (!validation.success) {
      throw new Error(`Invalid max weekly orders: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }
    await this.settingsRepository.set(SETTING_KEYS.MAX_WEEKLY_ORDERS, value);
  }

  // Pickup Instructions
  async getPickupInstructions(): Promise<PickupInstructionsSetting | null> {
    return this.settingsRepository.get<PickupInstructionsSetting>(SETTING_KEYS.PICKUP_INSTRUCTIONS);
  }

  async setPickupInstructions(value: PickupInstructionsSetting): Promise<void> {
    const validation = validate(pickupInstructionsSettingSchema, value);
    if (!validation.success) {
      throw new Error(`Invalid pickup instructions: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }
    await this.settingsRepository.set(SETTING_KEYS.PICKUP_INSTRUCTIONS, value);
  }

  // Business Info
  async getBusinessInfo(): Promise<BusinessInfoSetting | null> {
    return this.settingsRepository.get<BusinessInfoSetting>(SETTING_KEYS.BUSINESS_INFO);
  }

  async setBusinessInfo(value: BusinessInfoSetting): Promise<void> {
    const validation = validate(businessInfoSettingSchema, value);
    if (!validation.success) {
      throw new Error(`Invalid business info: ${validation.errors?.map((e) => e.message).join(', ')}`);
    }
    await this.settingsRepository.set(SETTING_KEYS.BUSINESS_INFO, value);
  }

  // Bulk operations
  async getAllSettings(): Promise<AllSettings> {
    const [serviceFeeRate, orderingEnabled, maxWeeklyOrders, pickupInstructions, businessInfo] =
      await Promise.all([
        this.getServiceFeeRate(),
        this.getOrderingEnabled(),
        this.getMaxWeeklyOrders(),
        this.getPickupInstructions(),
        this.getBusinessInfo(),
      ]);

    return {
      serviceFeeRate,
      orderingEnabled,
      maxWeeklyOrders,
      pickupInstructions,
      businessInfo,
    };
  }

  async updateAllSettings(settings: Partial<AllSettings>): Promise<void> {
    const updates: Promise<void>[] = [];

    if (settings.serviceFeeRate !== undefined) {
      updates.push(this.setServiceFeeRate(settings.serviceFeeRate!));
    }
    if (settings.orderingEnabled !== undefined) {
      updates.push(this.setOrderingEnabled(settings.orderingEnabled!));
    }
    if (settings.maxWeeklyOrders !== undefined) {
      updates.push(this.setMaxWeeklyOrders(settings.maxWeeklyOrders!));
    }
    if (settings.pickupInstructions !== undefined) {
      updates.push(this.setPickupInstructions(settings.pickupInstructions!));
    }
    if (settings.businessInfo !== undefined) {
      updates.push(this.setBusinessInfo(settings.businessInfo!));
    }

    await Promise.all(updates);
  }

  // Business operations
  async isOrderingOpen(): Promise<boolean> {
    const setting = await this.getOrderingEnabled();
    return setting?.enabled ?? true;
  }

  async calculateServiceFee(subtotal: number): Promise<number> {
    const setting = await this.getServiceFeeRate();
    const rate = setting?.rate ?? 0.05; // Default 5%
    return Math.round(subtotal * rate * 100) / 100; // Round to 2 decimal places
  }
}
