import { GET } from '@/app/api/data-centers/route';

describe('GET /api/data-centers', () => {
  it('returns all data centers', async () => {
    const req = new Request('http://localhost/api/data-centers', {
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
    expect(row).toHaveProperty('id');
    expect(row).toHaveProperty('latitude');
    expect(row).toHaveProperty('longitude');
    expect(typeof row.latitude).toBe('number');
    expect(typeof row.longitude).toBe('number');
  });

  it('filters by stage', async () => {
    const req = new Request('http://localhost/api/data-centers?stage=Active', {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    json.data.forEach((row: any) => {
      expect(row.stage).toBe('Active');
    });
  });

  it('filters by aiOnly', async () => {
    const req = new Request('http://localhost/api/data-centers?aiOnly=true', {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    json.data.forEach((row: any) => {
      expect(row.is_ai).toBe(1);
    });
  });

  it('returns 403 with missing API key', async () => {
    const req = new Request('http://localhost/api/data-centers', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
