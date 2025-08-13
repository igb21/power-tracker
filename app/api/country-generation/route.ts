import { NextResponse } from 'next/server';
import { getCountryGeneration } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

/**
 * API route handler for fetching country-level power generation data.
 * Protected by API key middleware via `withApiKey`.
 *
 * Expects a query parameter: `countries=USA,CAN,...`
 * Returns an array of generation data per country.
 */
export const GET = withApiKey(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const countries = searchParams.get('countries');

    // Validate that the 'countries' query parameter is provided
    if (!countries) {
      return NextResponse.json(
        { error: 'Missing required query parameter: countries' },
        { status: 400 }
      );
    }

    // Split the countries by comma and trim whitespace
    const countryCodes = countries.split(',').map((code) => code.trim());

    // Get data from the database
    let data;
    try {
      data = await getCountryGeneration(countryCodes);
    } catch (dbError: any) {
      // Handle database errors gracefully. 
      // Return a 500 with detailed error message using message returned from db access layer.
      return NextResponse.json(
        {
          error: 'Failed to fetch country generation data',
          details: dbError?.message ?? 'database error',
        },
        { status: 500 }
      );
    }

    // Return the data as JSON
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
