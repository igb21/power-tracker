'use client';

/**
 * FuelPieChartPage
 *
 * This page displays a pie chart showing total power generation (in megawatts)
 * grouped by fuel type. It fetches data from the `/api/fuel-capacity` endpoint.
 */

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Type for each row returned by the API
interface FuelCapacityRow {
  fuel: string;
  generation_mw: number;
}

// Color palette for up to 30 fuel types. There are 16 in the DB so this is sufficient.
const seriesColors = [
  '#0d8960ff', '#ef4444', '#f97316', '#3639e9ff', '#0ea5e9',
  '#520616ff', '#4c3462ff', '#facc15', '#22c55e', '#db2777',
  '#4f46e5', '#c026d3', '#10b981', '#e11d48', '#7e22ce',
  '#2563eb', '#d97706', '#14b8a6', '#a855f7', '#991b1b',
];


const FuelPieChartPage: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData<'pie'>>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/capacity-by-fuel', {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!,
          },
        });

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('API did not return JSON');
        }

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch fuel capacity');

        const rawData: FuelCapacityRow[] = json.data;

        const labels = rawData.map((row) => row.fuel);
        const data = rawData.map((row) => row.generation_mw);
        const backgroundColor = rawData.map((_, i) => seriesColors[i % 30]);

        setChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor,
              borderWidth: 1,
            },
          ],
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Pie chart fetch error:', message);
        setChartData({ labels: [], datasets: [] });
      }
    };

    fetchData();
  }, []);

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#444' },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw as number;
            return `${ctx.label}: ${value.toLocaleString()} MW`;
          },
        },
      },
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Fuel Type Generation (MW)</h2>
      {chartData.labels?.length ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p className="text-gray-500">Loading chart data or no data available.</p>
      )}
    </div>
  );
};

export default FuelPieChartPage;