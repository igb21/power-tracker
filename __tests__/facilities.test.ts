    import { GET } from '@/app/api/facilities/route'; 

    describe('GET /api/facilities (unwrapped)', () => {
      it('returns facility data for valid query', async () => {
        const url = new URL('http://localhost/api/facilities?country=USA&fuel=1');

        const req = new Request(url.toString(), {
            method: 'GET',
            headers: {
             'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string
          },
        });

        const res = await GET(req);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toHaveProperty('data');
        expect(Array.isArray(json.data)).toBe(true);

        if (json.data.length > 0) {
          const facility = json.data[0];
          expect(facility).toHaveProperty('gppd_idnr');
          expect(facility.country_code).toBe('USA');
          expect(facility.fuel_code).toBe(1);

        }
      });
    });
