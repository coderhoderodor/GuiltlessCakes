/**
 * Admin Settings API - CRUD Operations
 *
 * GET    /api/admin/settings     - Get all settings
 * PUT    /api/admin/settings     - Update multiple settings at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSettingsService } from '@/lib/services';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';
import { validate, updateAllSettingsSchema } from '@/lib/validation';

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settingsService = createSettingsService(auth.supabase);
    const settings = await settingsService.getAllSettings();

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate request body
    const validation = validate(updateAllSettingsSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const settingsService = createSettingsService(auth.supabase);
    await settingsService.updateAllSettings(validation.data!);

    // Return updated settings
    const settings = await settingsService.getAllSettings();

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
