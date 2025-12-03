/**
 * Admin Inquiries API - CRUD Operations
 *
 * GET    /api/admin/inquiries     - List all inquiries (with optional status filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInquiryService } from '@/lib/services';
import type { InquiryStatus } from '@/types';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const inquiryService = createInquiryService(auth.supabase);

    let inquiries;
    if (status) {
      inquiries = await inquiryService.getInquiriesByStatus(status as InquiryStatus);
    } else {
      inquiries = await inquiryService.getAllInquiries();
    }

    return NextResponse.json({ data: inquiries });
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
