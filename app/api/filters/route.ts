import { NextResponse } from 'next/server';
import { getFilterMetadata } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

/**
 * Protected API route to fetch sidebar filter metadata.
 * Requires a valid API key via `withApiKey`.
 *
 * Returns:
 *   {
 *     countries: [{ code: 'USA', name: 'United States' }, ...],
 *     fuelSources: [{ code: 1, name: 'Solar' }, ...]
 *   }
 *
 * Error Handling:
 *   - If the database query fails, returns a 500 with the DB error message.
 *   - If any other unexpected error occurs, returns a generic 500 response.
 */
export const GET = withApiKey(async (req: Request) => {
  try {
    // Attempt to fetch filter metadata from the database
    let metadata;
    try {
      metadata = await getFilterMetadata();
    } catch (dbError: any) {
      // If the DB query fails, return a structured error response
      return NextResponse.json(
        {
          error: 'Failed to fetch filter metadata',
          details: dbError?.message ?? 'Unknown database error',
        },
        { status: 500 }
      );
    }

    // If successful, return the metadata as JSON
    return NextResponse.json(metadata);
  } catch (err: any) {
    // Catch any unexpected runtime errors (e.g. malformed request, middleware failure)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: err?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
});