'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

type Filters = {
  country: string;
  fuel: number | null;
  includeMicro: boolean;
};

type SidebarFilterProps = {
  onFilterChange: (filters: Filters) => void;
  disableCountry?: boolean;
  disableFuel?: boolean;
};

export default function SidebarFilter({
  onFilterChange,
  disableCountry = false,
  disableFuel = false,
}: SidebarFilterProps) {
  const [country, setCountry] = useState('');
  const [fuel, setFuel] = useState<number | null>(null);
  const [includeMicro, setIncludeMicro] = useState(false);
  const [countries, setCountries] = useState<{ code: string; country: string }[]>([]);
  const [fuelSources, setFuelSources] = useState<{ code: number; fuelSource: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await fetch('/api/filters', {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load filter metadata');
        setCountries(json.countries);
        setFuelSources(json.fuelSources);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (disableCountry) setCountry('');
  }, [disableCountry]);

  const handleUpdate = () => {
    onFilterChange({ country, fuel, includeMicro });
  };

  return (
    <Card>
      <Card.Header className="bg-primary text-white fw-semibold">Filters</Card.Header>
      <Card.Body className="d-flex flex-column gap-3">
        {loading && <p className="text-muted small mb-0">Loading filter options...</p>}
        {error && <p className="text-danger small mb-0">Error: {error}</p>}

        {!loading && !error && (
          <>
            <Form.Group>
              <Form.Label className="fw-medium small">Country</Form.Label>
              <Form.Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={disableCountry}
                size="sm"
              >
                <option value="">All</option>
                {countries.map(({ code, country }) => (
                  <option key={code} value={code}>{country}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {!disableFuel && (
              <Form.Group>
                <Form.Label className="fw-medium small">Fuel Source</Form.Label>
                <Form.Select
                  value={fuel === null ? '' : String(fuel)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFuel(val === '' ? null : parseInt(val, 10));
                  }}
                  size="sm"
                >
                  <option value="">All</option>
                  {fuelSources.map(({ code, fuelSource }) => (
                    <option key={code} value={code}>{fuelSource}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Check
              type="checkbox"
              id="includeMicro"
              label="Include Micro Facilities"
              checked={includeMicro}
              onChange={(e) => setIncludeMicro(e.target.checked)}
            />

            <Button variant="primary" size="sm" onClick={handleUpdate} className="w-100">
              Apply Filters
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
