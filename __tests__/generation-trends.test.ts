import { GET } from '@/app/api/generation-trends/route';

describe('GET /api/generation-trends', () => {
  it('returns generation trend data', async () => {
    const req = new Request('http://localhost/api/generation-trends', {
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
    expect(row).toHaveProperty('year');
    expect(row).toHaveProperty('variable');
    expect(row).toHaveProperty('value');
    expect(typeof row.year).toBe('number');
    expect(typeof row.value).toBe('number');
  });

  it('filters by country returns data', async () => {
    const req = new Request('http://localhost/api/generation-trends?country=USA', {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('returns 403 with missing API key', async () => {
    const req = new Request('http://localhost/api/generation-trends', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
