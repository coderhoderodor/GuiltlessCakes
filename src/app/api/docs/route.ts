/**
 * OpenAPI Specification Endpoint
 *
 * GET /api/docs - Returns the OpenAPI specification as JSON
 */

import { NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/openapi/spec';

export async function GET() {
  return NextResponse.json(openApiSpec);
}
