import { NextResponse } from 'next/server';
import { getCountryFuelCapacity } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

export const GET = withApiKey(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const countryCode  = searchParams.get('country')      || null;
  const includeMicro = searchParams.get('includeMicro') === 'true';
  try {
    const data = await getCountryFuelCapacity(countryCode, includeMicro);
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
});
