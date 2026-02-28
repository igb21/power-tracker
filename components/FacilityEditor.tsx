'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Facility } from '@/lib/dbSchema';
import { Form, Button, Row, Col } from 'react-bootstrap';

type FilterOption = { value: string; label: string };

const facilitySchema = z.object({
  gppd_idnr: z.string().min(1, 'GPPD ID is required'),
  name: z.string().min(1, 'Name is required'),
  capacity_mw: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().min(0, 'Capacity must be a positive number')
  ).refine((val) => !isNaN(val), { message: 'Capacity is required' }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  country_code: z.string().optional(),
  country_long: z.string().optional(),
  fuel: z.string().optional(),
  fuel_code: z.number().optional(),
  owner: z.string().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

export default function FacilityEditor({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData: Facility;
  onSubmit: (updated: Facility) => void;
  onClose?: () => void;
}) {
  const [countries, setCountries] = useState<FilterOption[]>([]);
  const [fuels, setFuels] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(facilitySchema),
    mode: 'onChange',
    defaultValues: {
      gppd_idnr: initialData.gppd_idnr,
      name: initialData.name,
      capacity_mw: initialData.capacity_mw ?? 0,
      latitude: initialData.latitude,
      longitude: initialData.longitude,
      country_code: initialData.country_code ?? '',
      country_long: initialData.country_long ?? '',
      fuel: initialData.fuel ?? '',
      fuel_code: initialData.fuel_code ?? 1,
      owner: initialData.owner ?? '',
    },
  });

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await fetch('/api/filters', {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load filter metadata');
        setCountries(json.countries.map(({ code, country }: { code: string; country: string }) => ({ value: code, label: country })));
        setFuels(json.fuelSources.map(({ code, fuelSource }: { code: number; fuelSource: string }) => ({ value: String(code), label: fuelSource })));
      } catch (err: any) {
        setFetchError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata();
  }, []);

  const onValidSubmit = async (data: FacilityFormData) => {
    setSubmitError(null);
    try {
      const res = await fetch('/api/facilities/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!,
        },
        body: JSON.stringify(data),
      });
      let json: any = {};
      try { json = await res.json(); } catch { /* non-JSON response */ }
      if (!res.ok) throw new Error(json.error || res.statusText || 'Unknown error');
      onSubmit({ ...initialData, ...data });
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Update failed:', err.message);
      setSubmitError(`Update failed: ${err.message}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onValidSubmit)} className="p-3 border rounded bg-white" style={{ maxWidth: '480px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Facility Editor</h5>
        {onClose && (
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
        )}
      </div>

      {fetchError && <p className="text-danger small">{fetchError}</p>}
      {loading && <p className="text-muted small">Loading filter options...</p>}

      {!loading && (
        <>
          <input type="hidden" {...register('gppd_idnr')} />

          <Form.Group className="mb-3">
            <Form.Label className="small fw-medium">Name *</Form.Label>
            <Form.Control size="sm" type="text" {...register('name')} isInvalid={!!errors.name} />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-medium">Owner</Form.Label>
            <Form.Control size="sm" type="text" {...register('owner')} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-medium">Capacity (MW) *</Form.Label>
            <Form.Control size="sm" type="number" step="any" {...register('capacity_mw', { valueAsNumber: true })} isInvalid={!!errors.capacity_mw} />
            <Form.Control.Feedback type="invalid">{errors.capacity_mw?.message}</Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Label className="small fw-medium">Latitude *</Form.Label>
              <Form.Control size="sm" type="number" step="any" {...register('latitude', { valueAsNumber: true })} isInvalid={!!errors.latitude} />
              <Form.Control.Feedback type="invalid">{errors.latitude?.message}</Form.Control.Feedback>
            </Col>
            <Col>
              <Form.Label className="small fw-medium">Longitude *</Form.Label>
              <Form.Control size="sm" type="number" step="any" {...register('longitude', { valueAsNumber: true })} isInvalid={!!errors.longitude} />
              <Form.Control.Feedback type="invalid">{errors.longitude?.message}</Form.Control.Feedback>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-medium">Country</Form.Label>
            <Form.Select size="sm" {...register('country_long')}>
              <option value="">Select country</option>
              {countries.map(({ value, label }) => (
                <option key={value} value={label}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-medium">Fuel Source</Form.Label>
            <Form.Select size="sm" {...register('fuel')}>
              <option value="">Select fuel</option>
              {fuels.map(({ value, label }) => (
                <option key={value} value={label}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Save Facility
          </Button>

          {submitError && <p className="text-danger small mt-2">{submitError}</p>}
        </>
      )}
    </Form>
  );
}
