import { NextResponse } from 'next/server';
import { getDataCenters } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

export const GET = withApiKey(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const stage  = searchParams.get('stage')  || null;
  const aiOnly = searchParams.get('aiOnly') === 'true';

  try {
    const data = await getDataCenters(stage, aiOnly);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch data centers', details: error?.message ?? 'database error' },
      { status: 500 }
    );
  }
});
