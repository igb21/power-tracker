import { GET } from '@/app/api/country-capacity/route'; 

describe('GET /api/country-capacity (unwrapped)', () => {
  it('returns country capacity data for valid query', async () => {
    const url = new URL('http://localhost/api/country-capacity?fuel=1');

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
      expect(row).toHaveProperty('country_code');
      expect(row).toHaveProperty('country_long');
      expect(row).toHaveProperty('capacity_mw');

      // Check types and values
      expect(typeof row.country_code).toBe('string');
      expect(typeof row.country_long).toBe('string');
      expect(typeof row.capacity_mw).toBe('number');
      expect(row.capacity_mw).toBeGreaterThanOrEqual(0);
    }
  });
});