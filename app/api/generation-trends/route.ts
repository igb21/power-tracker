import { NextResponse } from 'next/server';
import { getGenerationTrends } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';
import { gppdToEmber } from '@/lib/fuelColors';

export const GET = withApiKey(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get('country') || null;

  // Translate GPPD fuel_code → Ember variable name (null if no filter or no mapping)
  const fuelParam   = searchParams.get('fuel');
  const fuelCode    = fuelParam ? parseInt(fuelParam, 10) : null;
  const emberVariable = fuelCode ? (gppdToEmber[fuelCode] ?? null) : null;

  try {
    const data = await getGenerationTrends(countryCode, emberVariable);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch generation trends', details: error?.message ?? 'database error' },
      { status: 500 }
    );
  }
});
