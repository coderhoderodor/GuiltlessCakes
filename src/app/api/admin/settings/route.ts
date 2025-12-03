/**
 * Admin Settings API - CRUD Operations
 *
 * GET    /api/admin/settings     - Get all settings
 * PUT    /api/admin/settings     - Update multiple settings at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSettingsService, AllSettings } from '@/lib/services';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';

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
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
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

    const body = await request.json() as Partial<AllSettings>;

    const settingsService = createSettingsService(auth.supabase);
    await settingsService.updateAllSettings(body);

    // Return updated settings
    const settings = await settingsService.getAllSettings();

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
