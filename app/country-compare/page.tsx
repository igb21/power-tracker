'use client';

/**
 * This page displays a chart comparing energy generation across multiple countries over time.
 * Users can select countries from a dropdown and toggle between line and bar chart views.
 * Country options are fetched dynamically from the filter API.
 * Generation data is fetched from the country-generation API and typed using the Generation schema.
 */

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  BarController,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Select from 'react-select';
import { ChartData, ChartOptions } from 'chart.js';
import { Generation } from '@/lib/dbSchema'; // Only import the Drizzle type

// Register chart.js components so they can be used in charts
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  BarController
);

// A custom palette of distinct colors used to style each country's chart line or bar
const seriesColors = [
  '#0d8960ff', '#ef4444', '#f97316', '#3639e9ff', '#0ea5e9',
  '#520616ff', '#4c3462ff', '#facc15', '#22c55e', '#db2777',
  '#4f46e5', '#c026d3',
];

const ChartPage: React.FC = () => {
  const [selectedCountries, setSelectedCountries] = useState<
    { value: string; label: string }[]
  >([]);

  const [countryOptions, setCountryOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [datasets, setDatasets] = useState<ChartData<'line'>['datasets']>([]);
  const [labels, setLabels] = useState<string[]>([]);

  // Fetch country options for the dropdown when the page loads
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/filters', {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!,
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch filters');

        const countries = json.countries as { code: string; country: string }[];
        const options = countries.map((c) => ({
          value: c.code,
          label: c.country,
        }));

        setCountryOptions(options);

        const defaultCountry = options.find((c) => c.value === 'USA');
        if (defaultCountry) {
          setSelectedCountries([defaultCountry]);
        }
      } catch (err: any) {
        console.error('Country fetch error:', err.message);
        setCountryOptions([]);
      }
    };

    fetchCountries();
  }, []);

  // Fetch generation data when selected countries or chart type changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedCountries.length === 0) {
        setDatasets([]);
        setLabels([]);
        return;
      }

      const countryCodes = selectedCountries.map((c) => c.value).join(',');
      const url = `/api/country-generation?countries=${countryCodes}`;

      try {
        const res = await fetch(url, {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!,
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch generation data');

        // Cast API result to Generation[] type
        const generationRows = json.data as Generation[];

        // Group generation data by country code
        const grouped: Record<string, Generation[]> = {};
        generationRows.forEach((row) => {
          if (!grouped[row.country_code]) grouped[row.country_code] = [];
          grouped[row.country_code].push(row);
        });

        // Extract all unique years and sort them
        const allYears = Array.from(
          new Set(generationRows.map((r) => r.year))
        ).sort((a, b) => a - b);
        setLabels(allYears.map((y) => y.toString()));

        // Build chart datasets for each selected country
        const newDatasets = selectedCountries.map((c, i) => {
          const color = seriesColors[i % seriesColors.length];
          const countryData = grouped[c.value] || [];

          const yearMap = Object.fromEntries(
            countryData.map((d) => [d.year, d.total_generation])
          );

          const data = allYears.map((year) => yearMap[year] ?? 0);

          return {
            label: c.label,
            data,
            borderColor: color,
            backgroundColor: chartType === 'bar' ? color : 'transparent',
            fill: chartType === 'bar',
            stepped: chartType === 'line',
            pointRadius: chartType === 'line' ? 3 : 0,
          };
        });

        setDatasets(newDatasets);
      } catch (err: any) {
        console.error('Chart fetch error:', err.message);
        setDatasets([]);
        setLabels([]);
      }
    };

    fetchData();
  }, [selectedCountries, chartType]);

  const chartData: ChartData<'line' | 'bar'> = {
    labels,
    datasets,
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#444', boxWidth: 12 },
      },
      tooltip: { enabled: true },
      title: { display: false },
    },
    scales: {
      x: {
        stacked: chartType === 'bar',
        ticks: { color: '#444' },
        grid: { display: false },
      },
      y: {
        stacked: chartType === 'bar',
        beginAtZero: true,
        ticks: { color: '#444' },
        grid: { color: '#ddd' },
      },
    },
  };

  return (
    <main className="bg-white px-2 text-gray-800 z-10 relative">
      <div className="w-full h-[75vh] border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
        {/* Header with chart type toggle button */}
        <div className="bg-blue-900 text-white px-2 py-1 font-semibold flex justify-between items-center">
          <span>Generation vs Time</span>
          <button
            onClick={() =>
              setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))
            }
            className="bg-white text-blue-900 px-3 py-1 text-sm rounded hover:bg-blue-100 transition"
          >
            Switch to {chartType === 'line' ? 'Bar' : 'Line'}
          </button>
        </div>

        {/* Country selector dropdown */}
        <div className="px-4 pt-4 pb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select up to 10 countries
          </label>
          <Select
            options={countryOptions}
            value={selectedCountries}
            onChange={(val) => setSelectedCountries(val.slice(0, 10))}
            isMulti
            maxMenuHeight={160}
          />
        </div>

        {/* Chart display area */}
        <div className="flex-grow px-4 pb-4 pt-2">
          <div className="h-full w-full">
            {chartType === 'line' ? (
              <Line
                data={chartData as ChartData<'line'>}
                options={options as ChartOptions<'line'>}
              />
            ) : (
              <Bar
                data={chartData as ChartData<'bar'>}
                options={options as ChartOptions<'bar'>}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChartPage;