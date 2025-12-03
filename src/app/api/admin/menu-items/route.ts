/**
 * Admin Menu Items API - CRUD Operations
 *
 * GET    /api/admin/menu-items     - List all menu items
 * POST   /api/admin/menu-items     - Create a new menu item
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMenuService } from '@/lib/services';
import { validate, createMenuItemSchema } from '@/lib/validation';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const menuService = createMenuService(auth.supabase);
    const menuItems = await menuService.getAllMenuItems();

    return NextResponse.json({ data: menuItems });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate request body
    const validation = validate(createMenuItemSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const menuService = createMenuService(auth.supabase);
    const menuItem = await menuService.createMenuItem(validation.data!);

    return NextResponse.json({ data: menuItem }, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
