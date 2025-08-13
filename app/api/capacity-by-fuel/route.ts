import { NextResponse } from 'next/server';
import { getFuelTypeCapacity } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

/**
 * API route handler for fetching total power generation by fuel type.
 * Protected by API key middleware via `withApiKey`.
 * Returns an array of fuel types with their total generation in MW.
 */
export const GET = withApiKey(async (_req: Request) => {
  try {
    let data;
    try {
      data = await getFuelTypeCapacity();
    } catch (dbError: any) {
      return NextResponse.json(
        {
          error: 'Failed to fetch fuel capacity data',
          details: dbError?.message ?? 'database error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: err?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
});