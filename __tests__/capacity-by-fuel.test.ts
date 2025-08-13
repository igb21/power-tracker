import { GET } from '@/app/api/capacity-by-fuel/route';

describe('GET /api/fuel-capacity (unwrapped)', () => {
  it('returns total generation data grouped by fuel type', async () => {
    const url = new URL('http://localhost/api/fuel-capacity');

    const req = new Request(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);

    if (json.data.length > 0) {
      const row = json.data[0];

      // Check expected fields
      expect(row).toHaveProperty('fuel_code');
      expect(row).toHaveProperty('generation_mw');

      // Check types
      expect(typeof row.fuel_code).toBe('number');
      expect(typeof row.generation_mw).toBe('number');

      // Optional: check for non-negative values
      expect(row.generation_mw).toBeGreaterThanOrEqual(0);
    }
  });
});
