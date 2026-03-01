import { GET } from '@/app/api/country-fuel-capacity/route';

describe('GET /api/country-fuel-capacity', () => {
  it('returns country × fuel capacity data', async () => {
    const req = new Request('http://localhost/api/country-fuel-capacity', {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);

    const row = json.data[0];
    expect(row).toHaveProperty('country_code');
    expect(row).toHaveProperty('fuel');
    expect(row).toHaveProperty('capacity_mw');
    expect(typeof row.capacity_mw).toBe('number');
  });

  it('filters by country', async () => {
    const req = new Request('http://localhost/api/country-fuel-capacity?country=USA', {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    json.data.forEach((row: any) => {
      expect(row.country_code).toBe('USA');
    });
  });

  it('returns 403 with missing API key', async () => {
    const req = new Request('http://localhost/api/country-fuel-capacity', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
