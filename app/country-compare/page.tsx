'use client';

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
import { Generation } from '@/lib/dbSchema';
import { Card, Button } from 'react-bootstrap';

ChartJS.register(
  LineElement, BarElement, PointElement, CategoryScale,
  LinearScale, Tooltip, Legend, Title, BarController
);

const seriesColors = [
  '#0d8960ff', '#ef4444', '#f97316', '#3639e9ff', '#0ea5e9',
  '#520616ff', '#4c3462ff', '#facc15', '#22c55e', '#db2777',
  '#4f46e5', '#c026d3',
];

const ChartPage: React.FC = () => {
  const [selectedCountries, setSelectedCountries] = useState<{ value: string; label: string }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [datasets, setDatasets] = useState<ChartData<'line'>['datasets']>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/filters', {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY! },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch filters');
        const countries = json.countries as { code: string; country: string }[];
        const options = countries.map((c) => ({ value: c.code, label: c.country }));
        setCountryOptions(options);
        const defaultCountry = options.find((c) => c.value === 'USA');
        if (defaultCountry) setSelectedCountries([defaultCountry]);
      } catch (err: any) {
        console.error('Country fetch error:', err.message);
        setCountryOptions([]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCountries.length === 0) { setDatasets([]); setLabels([]); return; }
      const countryCodes = selectedCountries.map((c) => c.value).join(',');
      try {
        const res = await fetch(`/api/country-generation?countries=${countryCodes}`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY! },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch generation data');
        const generationRows = json.data as Generation[];
        const grouped: Record<string, Generation[]> = {};
        generationRows.forEach((row) => {
          if (!grouped[row.country_code]) grouped[row.country_code] = [];
          grouped[row.country_code].push(row);
        });
        const allYears = Array.from(new Set(generationRows.map((r) => r.year))).sort((a, b) => a - b);
        setLabels(allYears.map((y) => y.toString()));
        setDatasets(selectedCountries.map((c, i) => {
          const color = seriesColors[i % seriesColors.length];
          const countryData = grouped[c.value] || [];
          const yearMap = Object.fromEntries(countryData.map((d) => [d.year, d.total_generation]));
          return {
            label: c.label,
            data: allYears.map((year) => yearMap[year] ?? 0),
            borderColor: color,
            backgroundColor: chartType === 'bar' ? color : 'transparent',
            fill: chartType === 'bar',
            stepped: chartType === 'line',
            pointRadius: chartType === 'line' ? 3 : 0,
          };
        }));
      } catch (err: any) {
        console.error('Chart fetch error:', err.message);
        setDatasets([]); setLabels([]);
      }
    };
    fetchData();
  }, [selectedCountries, chartType]);

  const chartData: ChartData<'line' | 'bar'> = { labels, datasets };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { color: '#444', boxWidth: 12 } },
      tooltip: { enabled: true },
      title: { display: false },
    },
    scales: {
      x: { stacked: chartType === 'bar', ticks: { color: '#444' }, grid: { display: false } },
      y: { stacked: chartType === 'bar', beginAtZero: true, ticks: { color: '#444' }, grid: { color: '#ddd' } },
    },
  };

  return (
    <Card style={{ height: '75vh' }} className="overflow-hidden d-flex flex-column">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-2">
        <span className="fw-semibold">Generation vs Time</span>
        <Button
          variant="light"
          size="sm"
          onClick={() => setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))}
        >
          Switch to {chartType === 'line' ? 'Bar' : 'Line'}
        </Button>
      </Card.Header>

      <Card.Body className="d-flex flex-column p-3 gap-3" style={{ minHeight: 0 }}>
        <div>
          <label className="form-label small fw-medium">Select up to 10 countries</label>
          <Select
            options={countryOptions}
            value={selectedCountries}
            onChange={(val) => setSelectedCountries(val.slice(0, 10))}
            isMulti
            maxMenuHeight={160}
          />
        </div>
        <div className="flex-grow-1" style={{ minHeight: 0 }}>
          {chartType === 'line' ? (
            <Line data={chartData as ChartData<'line'>} options={options as ChartOptions<'line'>} />
          ) : (
            <Bar data={chartData as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ChartPage;
