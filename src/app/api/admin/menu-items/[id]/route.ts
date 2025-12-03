/**
 * Admin Menu Item API - Individual CRUD Operations
 *
 * GET    /api/admin/menu-items/[id]     - Get a specific menu item
 * PUT    /api/admin/menu-items/[id]     - Update a menu item
 * DELETE /api/admin/menu-items/[id]     - Delete a menu item
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMenuService } from '@/lib/services';
import { validate, updateMenuItemSchema } from '@/lib/validation';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const menuService = createMenuService(auth.supabase);
    const menuItem = await menuService.getMenuItem(id);

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: menuItem });
  } catch (error) {
    console.error('Failed to fetch menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate request body
    const validation = validate(updateMenuItemSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const menuService = createMenuService(auth.supabase);
    const menuItem = await menuService.updateMenuItem(id, validation.data!);

    return NextResponse.json({ data: menuItem });
  } catch (error) {
    console.error('Failed to update menu item:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const menuService = createMenuService(auth.supabase);
    await menuService.deleteMenuItem(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
