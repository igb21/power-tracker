import { PUT } from '@/app/api/facilities/update/route';

describe('PUT /api/facilities/update (unwrapped)', () => {
  it('updates a facility with valid data', async () => {
    const url = new URL('http://localhost/api/facilities/update');

    const payload = {
      gppd_idnr: 'GBR0000799', // I used ane existing small power plant ID in Scotland to test this. Db mocking is out of scope for this exercise.
      name: 'Drummond Moor Landfill',
      capacity_mw: 150,
      latitude: 37.7749,
      longitude: -122.4194,
      country_code: 'GBR',
      fuel_code: 1,
      owner: 'Test Owner',
    };

    const req = new Request(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string,
      },
      body: JSON.stringify(payload),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('updated');

    // Validate updated fields
    expect(json.updated.name).toBe(payload.name);
    expect(json.updated.capacity_mw).toBe(payload.capacity_mw);
    expect(json.updated.latitude).toBe(payload.latitude);
    expect(json.updated.longitude).toBe(payload.longitude);
    expect(json.updated.country_code).toBe(payload.country_code);
    expect(json.updated.fuel_code).toBe(payload.fuel_code);
    expect(json.updated.owner).toBe(payload.owner);
  });
});