/**
 * Admin Inquiries API - CRUD Operations
 *
 * GET    /api/admin/inquiries     - List all inquiries (with optional status filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInquiryService } from '@/lib/services';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';
import { inquiryStatusSchema } from '@/lib/validation';
import type { InquiryStatus } from '@/types';

// Valid inquiry statuses for filtering
const VALID_INQUIRY_STATUSES = [
  'new', 'in_review', 'quoted', 'accepted', 'in_progress',
  'ready_for_pickup', 'completed', 'rejected', 'closed'
] as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const inquiryService = createInquiryService(auth.supabase);

    // Validate status parameter if provided
    let validatedStatus: InquiryStatus | undefined;
    if (status) {
      const result = inquiryStatusSchema.safeParse(status);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid status parameter', validStatuses: VALID_INQUIRY_STATUSES },
          { status: 400 }
        );
      }
      validatedStatus = result.data;
    }

    let inquiries;
    if (validatedStatus) {
      inquiries = await inquiryService.getInquiriesByStatus(validatedStatus);
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
