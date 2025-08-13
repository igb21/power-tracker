import { NextResponse } from 'next/server';
import { getCountryCapacity } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

/**
 * API route handler for fetching country-level power capacity data.
 * Protected by API key middleware via `withApiKey`.
 *
 * Optional query parameter: `fuel=1`
 * Returns an array of capacity data per country.
 */
export const GET = withApiKey(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const fuelParam = searchParams.get('fuel');

    // Convert fuel param to number if present
    const fuelCode = fuelParam !== null ? parseInt(fuelParam) : null;

    // If fuel is not a valid number, treat as null
    const fuel = Number.isNaN(fuelCode) ? null : fuelCode;

    // Get data from the database
    let data;
    try {
      data = await getCountryCapacity(fuel);
    } catch (dbError: any) {
      // Handle database errors gracefully
      return NextResponse.json(
        {
          error: 'Failed to fetch country capacity data',
          details: dbError?.message ?? 'database error',
        },
        { status: 500 }
      );
    }

    // Return the data as JSON
    return NextResponse.json({ data });
  } catch (err: any) {
    // Catch unexpected errors 
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: err?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
});
