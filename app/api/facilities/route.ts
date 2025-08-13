      import { NextResponse } from 'next/server';
      import { getFacilities } from '@/lib/dbQueries';
      import { withApiKey } from '@/app/api/api-authenticator';

      /**
       * API route handler for fetching facilities.
       * Protected by API key middleware via `withApiKey`.
       *
       * Accepts optional query parameters:
       *   - `country=USA`
       *   - `fuel=1` (integer fuel code)
       *
       * Returns an array of facility records matching the filters.
       */
      export const GET = withApiKey(async (req: Request) => {
      try {
        const { searchParams } = new URL(req.url);
        const country_code = searchParams.get('country');
        const fuel_code = searchParams.get('fuel');
        const micro = searchParams.get('includeMicro');

        // Normalize country code
        const normalizedCountry = country_code?.trim() || null;

        // Validate fuel parameter. Expects an integer or null.
        let fuelCode: number | null = null;
        if (fuel_code !== null) {
          const parsed = parseInt(fuel_code.trim(), 10);
          if (!isNaN(parsed)) {
            fuelCode = parsed;
          } else {
            // 400 Bad Request if fuel code is not a valid integer
            return NextResponse.json(
              { error: 'Invalid fuel code: must be an integer' },
              { status: 400 }
            );
          }
        }

        // Validate includeMicro parameter
        let includeMicro = false;
        if (micro !== null) {
          const normalizedMicro = micro.toLowerCase();
          if (normalizedMicro === 'true') {
            includeMicro = true;
          } else if (normalizedMicro === 'false') {
            includeMicro = false;
          } else {
            // 400 Bad Request if includeMicro is not a valid boolean
            return new Response(
              JSON.stringify({ error: 'Invalid value for includeMicro. Must be true or false.' }),
              { status: 400 }
            );
          }
        }

        // Get data from the database layer
        let data;
        try {
          data = await getFacilities(normalizedCountry, fuelCode, includeMicro);
        } catch (dbError: any) {
          return NextResponse.json(
            {
              // Error: return the database error message with a 500 status
              error: 'Failed to fetch facility data',
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
            // Generic error message for unexpected errors
            error: 'Internal Server Error',
            details: err?.message ?? 'Unknown error',
          },
          { status: 500 }
        );
      }
    });