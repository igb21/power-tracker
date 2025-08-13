'use client';

import { useState, useEffect } from 'react';

// Define the shape of the filters that will be passed to the parent component
type Filters = {
  country: string;
  fuel: number | null;
  includeMicro: boolean;
};

// Define the props accepted by SidebarFilter
type SidebarFilterProps = {
  onFilterChange: (filters: Filters) => void; // Function to send selected filters to parent
  disableCountry?: boolean; // Optional flag to disable the country dropdown
};

// Main SidebarFilter component
export default function SidebarFilter({
  onFilterChange,
  disableCountry = false, // Default to false (dropdown is enabled)
}: SidebarFilterProps) {
  // State to track selected values for each filter
  const [country, setCountry] = useState(''); // '' means "All"
  const [fuel, setFuel] = useState<number | null>(null); // null means "All"
  const [includeMicro, setIncludeMicro] = useState(false); // Checkbox for micro facilities

  // State to hold dropdown options fetched from the API
  const [countries, setCountries] = useState<{ code: string; country: string }[]>([]);
  const [fuelSources, setFuelSources] = useState<{ code: number; fuelSource: string }[]>([]);

  // State to track loading and error during API fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available countries and fuel sources when the component mounts
  useEffect(() => {
    async function fetchMetadata() {
      try {
        // Call the API to get filter options
        const res = await fetch('/api/filters', {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY as string, // API key from environment
          },
        });

        const json = await res.json();

        // If the response is not OK, throw an error
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load filter metadata');
        }

        // Save the dropdown options to state
        setCountries(json.countries);
        setFuelSources(json.fuelSources);
      } catch (err: any) {
        // Save error message to state
        setError(err.message || 'Unknown error');
      } finally {
        // Hide loading spinner
        setLoading(false);
      }
    }

    fetchMetadata();
  }, []);

  // If the country dropdown is disabled, force the selection to "All"
  useEffect(() => {
    if (disableCountry) {
      setCountry(''); // '' corresponds to the "All" option
    }
  }, [disableCountry]);

  // Send the selected filters to the parent component when the user clicks "Apply Filters"
  const handleUpdate = () => {
    onFilterChange({ country, fuel, includeMicro });
  };

  return (
    <aside className="w-64 p-4 bg-white border border-black shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] space-y-4 inline-flex flex-col self-start">
      {/* Show loading message while fetching filter options */}
      {loading && <div className="text-sm text-gray-500">Loading filter options...</div>}

      {/* Show error message if the fetch fails */}
      {error && <div className="text-sm text-red-500">Error: {error}</div>}

      {/* Render the filter controls only when data is loaded and no error */}
      {!loading && !error && (
        <>
          {/* Country dropdown */}
          <div>
            <label className="block font-medium text-sm mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={disableCountry} // Disable dropdown if prop is true
              className={`w-full border px-2 py-1 rounded bg-white/80 backdrop-blur-sm ${
                disableCountry ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {/* "All" option */}
              <option value="">All</option>

              {/* Render country options from API */}
              {countries.map(({ code, country }) => (
                <option key={code} value={code}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel source dropdown */}
          <div>
            <label className="block font-medium text-sm mb-1">Fuel Source</label>
            <select
              value={fuel === null ? '' : String(fuel)} // Convert number to string for select
              onChange={(e) => {
                const val = e.target.value;
                setFuel(val === '' ? null : parseInt(val, 10)); // Convert back to number
              }}
              className="w-full border px-2 py-1 rounded bg-white/80 backdrop-blur-sm"
            >
              {/* "All" option */}
              <option value="">All</option>

              {/* Render fuel source options from API */}
              {fuelSources.map(({ code, fuelSource }) => (
                <option key={code} value={code}>
                  {fuelSource}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox to include micro facilities */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeMicro"
              checked={includeMicro}
              onChange={(e) => setIncludeMicro(e.target.checked)}
              className="accent-blue-700"
            />
            <label htmlFor="includeMicro" className="text-sm font-medium">
              Include Micro Facilities
            </label>
          </div>

          {/* Button to apply selected filters */}
          <button
            onClick={handleUpdate}
            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-600 transition shadow border-blue-300 hover:shadow-lg font-medium"
          >
            Apply Filters
          </button>
        </>
      )}
    </aside>
  );
}