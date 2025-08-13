/**
 * Test helper for App Router-style API routes.
 * Validates API key enforcement and allows custom success assertions.
 *
 * @param label - Test suite label (e.g. route path)
 * @param handler - The App Router GET/POST/etc. handler to test
 * @param validQuery - Query params to include in the request
 * @param expectSuccess - Assertion callback for successful response
 */
export function authorizedRouteAppRouter(
  label: string,
  handler: (req: Request) => Promise<Response>,
  {
    validQuery,
    expectSuccess,
  }: {
    validQuery: Record<string, string>;
    expectSuccess: (res: Response, json: any) => void | Promise<void>;
  }
) {
  const VALID_KEY = process.env.REST_API_KEY!;

  // Builds a full URL with query params for the mock Request
  const buildUrl = (query: Record<string, string>) =>
    `http://localhost/api/test?${new URLSearchParams(query).toString()}`;

  // Creates a mock Request object with optional API key header
  const createRequest = (key: string | undefined, query: Record<string, string>) =>
    new Request(buildUrl(query), {
      method: 'GET',
      headers: key ? { 'x-api-key': key } : {},
    });

  describe(label, () => {
    it('should reject requests with missing API key', async () => {
      const req = createRequest(undefined, validQuery);
      const res = await handler(req);
      const json = await res.json();

      // Expect 403 Forbidden when no API key is provided
      expect(res.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });

    it('should reject requests with invalid API key', async () => {
      const req = createRequest('wrongkey123', validQuery);
      const res = await handler(req);
      const json = await res.json();

      // Expect 403 Forbidden when API key is incorrect
      expect(res.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });

    it('should return data when API key is valid', async () => {
      const req = createRequest(VALID_KEY, validQuery);
      const res = await handler(req);
      const json = await res.json();

      // Delegate success assertions to the caller
      await expectSuccess(res, json);
    });
  });
}