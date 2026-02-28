import { NextResponse } from 'next/server';
import { getDataCenters } from '@/lib/dbQueries';
import { withApiKey } from '@/app/api/api-authenticator';

export const GET = withApiKey(async (_req: Request) => {
  try {
    const data = await getDataCenters();
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
});
