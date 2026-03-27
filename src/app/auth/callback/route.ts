import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Cleanup: Supabase auth callback is no longer needed as we use Firebase.
 * This route now simply redirects to the home page.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}
