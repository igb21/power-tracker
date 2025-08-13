  import { GET } from '@/app/api/country-generation/route';

  describe('GET /api/country-generation (unwrapped)', () => {
    it('returns generation history data for valid country query', async () => {
      const url = new URL('http://localhost/api/country-generation?countries=USA,CAN');

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
        expect(row).toHaveProperty('year');
        expect(row).toHaveProperty('total_generation');

        // Check types and values
        expect(typeof row.country_code).toBe('string');
        expect(typeof row.year).toBe('number');
        expect(typeof row.total_generation).toBe('number');
        
      }
    })});