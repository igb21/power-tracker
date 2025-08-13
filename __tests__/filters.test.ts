import { GET } from '@/app/api/filters/route'; // adjust path if needed

describe('GET /api/filters (unwrapped)', () => {
  it('returns filter metadata with countries and fuelSources', async () => {
    const url = new URL('http://localhost/api/filters');

    const req = new Request(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();

    // Validate top-level keys
    expect(json).toHaveProperty('countries');
    expect(json).toHaveProperty('fuelSources');

    // Validate countries array
    expect(Array.isArray(json.countries)).toBe(true);
    if (json.countries.length > 0) {
      const country = json.countries[0];
      expect(country).toHaveProperty('code');
      expect(country).toHaveProperty('country');

    }

    // Validate fuelSources array
    expect(Array.isArray(json.fuelSources)).toBe(true);
    if (json.fuelSources.length > 0) {
      const fuel = json.fuelSources[0];
      expect(fuel).toHaveProperty('code');
      expect(fuel).toHaveProperty('fuelSource');

    }
  });
});