'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, Spinner, Badge, Button, Offcanvas } from 'react-bootstrap';
import { emberColorMap, EMBER_FUEL_ORDER, gppdToEmber } from '@/lib/fuelColors';
import SidebarFilter from '@/components/SidebarFilter';
import { SlidersHorizontal } from 'lucide-react';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

// ── Types ────────────────────────────────────────────────────────────────────

interface TrendRow {
  year: number;
  variable: string;
  value: number;
}

type Filters = { country: string; fuel: number | null; includeMicro: boolean };

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GenerationTrendsPage() {
  const [rows,        setRows]        = useState<TrendRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filters,     setFilters]     = useState<Filters>({ country: '', fuel: null, includeMicro: false });
  const [showFilters, setShowFilters] = useState(false);

  const headers = { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY! };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.country)            params.set('country', filters.country);
    if (filters.fuel !== null)      params.set('fuel',    String(filters.fuel));

    fetch(`/api/generation-trends?${params}`, { headers })
      .then((r) => r.json())
      .then((j) => setRows(j.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.country, filters.fuel]);

  // ── Build Chart.js stacked area data ────────────────────────────────────

  // All unique years from the data (sorted)
  const allYears = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => a - b);

  // Drop the final year if its total is less than 50% of the prior year's total
  // (guards against incomplete reporting in the most recent year)
  const yearTotals = new Map<number, number>();
  for (const row of rows) yearTotals.set(row.year, (yearTotals.get(row.year) ?? 0) + (row.value ?? 0));

  const years = allYears.filter((y, i) => {
    if (i === allYears.length - 1 && i > 0) {
      const prev = yearTotals.get(allYears[i - 1]) ?? 0;
      const curr = yearTotals.get(y) ?? 0;
      return prev === 0 || curr / prev >= 0.5;
    }
    return true;
  });

  // All unique fuel variables present, in the defined display order
  const variables = EMBER_FUEL_ORDER.filter((v) =>
    rows.some((r) => r.variable === v)
  );

  // Build lookup: variable → year → value
  const lookup = new Map<string, Map<number, number>>();
  for (const row of rows) {
    if (!lookup.has(row.variable)) lookup.set(row.variable, new Map());
    lookup.get(row.variable)!.set(row.year, row.value);
  }

  const chartData: ChartData<'line'> = {
    labels: years.map(String),
    datasets: variables.map((variable) => {
      const color = emberColorMap[variable] ?? '#6c757d';
      const byYear = lookup.get(variable) ?? new Map();
      return {
        label:           variable,
        data:            years.map((y) => byYear.get(y) ?? 0),
        borderColor:     color,
        backgroundColor: color + 'cc',  // ~80% opacity fill
        fill:            true,
        tension:         0.3,
        pointRadius:     0,
        borderWidth:     1,
      };
    }),
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { color: '#444', boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} TWh`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks:   { color: '#444', maxTicksLimit: 13 },
        grid:    { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          color:    '#444',
          callback: (v) => `${Number(v).toLocaleString()} TWh`,
        },
        title: { display: true, text: 'TWh', color: '#666' },
      },
    },
  };

  // ── Active filter label ──────────────────────────────────────────────────

  const filterParts: string[] = [];
  if (filters.country) filterParts.push(filters.country);
  if (filters.fuel !== null) {
    const mapped = gppdToEmber[filters.fuel];
    if (mapped) filterParts.push(mapped);
  }

  const activeCount = [filters.country, filters.fuel !== null].filter(Boolean).length;

  return (
    <div className="d-flex gap-3 py-3 align-items-start">

      {/* Mobile filter drawer */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-semibold">Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarFilter
            onFilterChange={(f) => {
              setFilters(f);
              setShowFilters(false);
            }}
          />
        </Offcanvas.Body>
      </Offcanvas>

      {/* ── Sidebar filter ─────────────────────────────────────────────── */}
      <div className="d-none d-md-block" style={{ width: '240px', flexShrink: 0 }}>
        <SidebarFilter onFilterChange={setFilters} />
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex-grow-1">
        {filterParts.length > 0 && (
          <div className="mb-2">
            <Badge bg="primary">Filtered: {filterParts.join(' · ')}</Badge>
          </div>
        )}

        <Card>
          <Card.Header className="bg-primary text-white fw-semibold d-flex justify-content-between align-items-center">
            <span>
              Electricity Generation by Fuel Type (TWh)
              {!filters.country && <span className="fw-normal ms-2 opacity-75">— World</span>}
            </span>
            {/* Mobile filter toggle */}
            <Button
              variant="light"
              size="sm"
              className="d-md-none d-flex align-items-center gap-1 py-0 px-2"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={13} />
              <span className="small">Filters</span>
              {activeCount > 0 && (
                <Badge bg="primary" className="ms-1" style={{ fontSize: '10px' }}>{activeCount}</Badge>
              )}
            </Button>
          </Card.Header>
          <Card.Body style={{ minHeight: '480px' }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '440px' }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-muted">No data available for the selected filters.</p>
            ) : (
              <div style={{ height: '440px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
