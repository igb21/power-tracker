  /**
   * PUT /api/facilities/update
   *
   * Updates a facility record in the database using its gppd_idnr.
   * Requires a valid x-api-key header for authentication.
   * Accepts a JSON body with updated facility fields.
   */

  import {  NextResponse } from 'next/server';
  import { updateFacility} from '@/lib/dbQueries';
  import { withApiKey } from '@/app/api/api-authenticator';
  import { z } from 'zod';

  // Zod is used here to validate the shape and content of the incoming JSON request.
  // It acts as a low code server side validation of the request body.
  const updateSchema = z.object({
    gppd_idnr: z.string().min(1, 'Facility gppd_idnr is required'), // required unique ID
    name: z.string().min(1), // required name
    capacity_mw: z.number().min(0), // must be a positive number
    latitude: z.number().min(-90).max(90), // valid latitude range
    longitude: z.number().min(-180).max(180), // valid longitude range
    country_code: z.string().optional(), // optional country code
    fuel_code: z.number().optional(), // optional fuel source code
    owner: z.string().optional(), // optional owner name
  });

  // Wrap the route handler with API key authentication
  export const PUT = withApiKey(async (req: Request) => {
    let body: unknown;

    // Try to parse the incoming JSON body
    try {
      body = await req.json();
    } catch {
      // If parsing fails, return a 400 Bad Request
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validate the parsed body against the schema (using Zod)
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      // If validation fails, return a 400 with error details
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    // Separate the ID from the rest of the update data
    const { gppd_idnr, ...updateData } = parsed.data;
  
    try {
        // Attempt to update the facility in the database
      await updateFacility(gppd_idnr, updateData);
      // Return 200 OK with the updated facility data and success flag
      return NextResponse.json({ success: true, updated: parsed.data });
    } catch (err: any) {
      // If the update fails, log the error and return a 500
      console.error('Update failed:', err);
      return NextResponse.json({ error: 'Failed to update facility' }, { status: 500 });
    }
  });