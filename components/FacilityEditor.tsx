  'use client'; // Enables client-side rendering in Next.js

  // Import React hooks and form utilities
  import { useEffect, useState } from 'react';
  import { useForm } from 'react-hook-form';
  import { z } from 'zod'; // Zod is used for schema-based validation
  import { zodResolver } from '@hookform/resolvers/zod'; // Connects Zod to react-hook-form
  import { Facility } from '@/lib/dbSchema'; // Type definition for a facility record

  // Type used for dropdown options
  type FilterOption = {
    value: string;
    label: string;
  };

  // Define validation rules for the form using Zod
  const facilitySchema = z.object({
    gppd_idnr: z.string().min(1, 'GPPD ID is required'),
    name: z.string().min(1, 'Name is required'),
    capacity_mw: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z.number().min(0, 'Capacity must be a positive number')
    ).refine((val) => !isNaN(val), {
      message: 'Capacity is required',
    }),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    country_code: z.string().optional(),
    country_long: z.string().optional(),
    fuel: z.string().optional(),
    fuel_code: z.number().optional(),
    owner: z.string().optional(),
  });

  // Infer TypeScript type from Zod schema
  type FacilityFormData = z.infer<typeof facilitySchema>;

  // Main component for editing a facility
  export default function FacilityEditor({
    initialData,
    onSubmit,
    onClose,
  }: {
    initialData: Facility;
    onSubmit: (updated: Facility) => void;
    onClose?: () => void;
  }) {
    // State for dropdown options and error/loading flags
    const [countries, setCountries] = useState<FilterOption[]>([]);
    const [fuels, setFuels] = useState<FilterOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    
  // Initialize react-hook-form with Zod validation.
    // The schema enforces field types and required values.
    // `defaultValues` pre-fills the form using initialData.
    // `register` binds inputs, `errors` holds validation messages.
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
    // Fetch dropdown metadata (countries and fuels) when component mounts
    useEffect(() => {
      async function fetchMetadata() {
        try {
          const res = await fetch('/api/filters', {
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string,
            },
          });

          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Failed to load filter metadata');

          // Convert raw API data into dropdown-friendly format
          const normalizedCountries: FilterOption[] = json.countries.map(
            ({ code, country }: { code: string; country: string }) => ({
              value: code,
              label: country,
            })
          );

          const normalizedFuelSources: FilterOption[] = json.fuelSources.map(
            ({ code, fuelSource }: { code: number; fuelSource: string }) => ({
              value: String(code),
              label: fuelSource,
            })
          );

          setCountries(normalizedCountries);
          setFuels(normalizedFuelSources);
        } catch (err: any) {
          setFetchError(err.message || 'Unknown error');
        } finally {
          setLoading(false);
        }
      }

      fetchMetadata();
    }, []);

    // Handle form submission when validation passes
    const onValidSubmit = async (data: FacilityFormData) => {
      setSubmitError(null); // clear previous error
      try {
        const res = await fetch(`/api/facilities/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!,
          },
          body: JSON.stringify(data),
        });

        let json: any = {};
        try {
          json = await res.json();
        } catch {
          // response body is not JSON
        }

        if (!res.ok) {
          throw new Error(json.error || res.statusText || 'Unknown error');
        }

        onSubmit({ ...initialData, ...data });
        if (onClose) onClose();
      } catch (err: any) {
        console.error('Update failed:', err.message);
        setSubmitError(`Update failed: ${err.message}`);
      }
    };

    return (
      <form
        onSubmit={handleSubmit(onValidSubmit)}
        className="relative space-y-4 max-w-md p-6 border rounded shadow bg-white"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold">Facility Editor</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-red-600 hover:text-red-800 text-2xl font-bold leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>

        {/* Show fetch error or loading spinner */}
        {fetchError && <div className="text-red-600 text-sm">{fetchError}</div>}
        {loading && <div className="text-sm text-gray-500">Loading filter options...</div>}

        {/* Render form fields only when metadata is loaded */}
        {!loading && (
          <>
            {/* Hidden field for facility ID */}
            <input type="hidden" {...register('gppd_idnr')} />

            {/* Name input */}
            <div>
              <label className="block text-sm font-medium">Name *</label>
              <input
                type="text"
                {...register('name')}
                className="w-full border px-2 py-1 rounded"
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            {/* Owner input */}
            <div>
              <label className="block text-sm font-medium">Owner</label>
              <input
                type="text"
                {...register('owner')}
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            {/* Capacity input */}
            <div>
              <label className="block text-sm font-medium">Capacity (MW) *</label>
              <input
                type="number"
                {...register('capacity_mw')}
                className="w-full border px-2 py-1 rounded"
              />
              {errors.capacity_mw && <p className="text-red-600 text-sm">{errors.capacity_mw.message}</p>}
            </div>

            {/* Latitude and Longitude inputs */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  {...register('latitude', { valueAsNumber: true })}
                  className="w-full border px-2 py-1 rounded"
                />
                {errors.latitude && <p className="text-red-600 text-sm">{errors.latitude.message}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  {...register('longitude', { valueAsNumber: true })}
                  className="w-full border px-2 py-1 rounded"
                />
                {errors.longitude && <p className="text-red-600 text-sm">{errors.longitude.message}</p>}
              </div>
            </div>

            {/* Country dropdown */}
            <div>
              <label className="block text-sm font-medium">Country</label>
              <select {...register('country_long')} className="w-full border px-2 py-1 rounded">
                <option value="">Select country</option>
                {countries.map(({ value, label }) => (
                  <option key={value} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel source dropdown */}
            <div>
              <label className="block text-sm font-medium">Fuel Source</label>
              <select {...register('fuel')} className="w-full border px-2 py-1 rounded">
                <option value="">Select fuel</option>
                {fuels.map(({ value, label }) => (
                              <option key={value} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Save Facility
            </button>

            {/* Show error message if submission fails */}
            {submitError && <p className="text-red-600 text-sm mt-2">{submitError}</p>}
          </>
        )}
      </form>
    );
  }