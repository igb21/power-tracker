'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { fuelColorMap } from '@/lib/fuelColors';
import SidebarFilter from '@/components/SidebarFilter';

ChartJS.register(
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend
);

// ── Types ──────────────────────────────────────────────────────────────────

interface FuelRow {
  fuel_code: number;
  fuel: string;
  generation_mw: number;
}

interface CountryFuelRow {
  country_long: string;
  country_code: string;
  fuel: string;
  fuel_code: number;
  capacity_mw: number;
}

// colours now come from the shared fuelColorMap (keyed by fuel_code)

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | undefined): string {
  if (n === undefined || n === 0) return '—';
  return n.toLocaleString();
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function FuelCapacityPage() {
  const [fuelData,    setFuelData]    = useState<FuelRow[]>([]);
  const [crossData,   setCrossData]   = useState<CountryFuelRow[]>([]);
  const [loadingFuel, setLoadingFuel] = useState(true);
  const [loadingCross,setLoadingCross]= useState(true);
  const [filters, setFilters] = useState<{ country: string; fuel: number | null; includeMicro: boolean }>({
    country: '', fuel: null, includeMicro: false,
  });

  const headers = { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY! };

  // Fetch fuel totals (shared by pie + pareto) — re-runs when filters change
  useEffect(() => {
    setLoadingFuel(true);
    const params = new URLSearchParams();
    if (filters.country) params.set('country', filters.country);
    params.set('includeMicro', String(filters.includeMicro));
    fetch(`/api/capacity-by-fuel?${params}`, { headers })
      .then((r) => r.json())
      .then((j) => setFuelData(j.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingFuel(false));
  }, [filters.country, filters.includeMicro]);

  // Fetch country × fuel cross-tab — re-runs when filters change
  useEffect(() => {
    setLoadingCross(true);
    const params = new URLSearchParams();
    if (filters.country) params.set('country', filters.country);
    params.set('includeMicro', String(filters.includeMicro));
    fetch(`/api/country-fuel-capacity?${params}`, { headers })
      .then((r) => r.json())
      .then((j) => setCrossData(j.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingCross(false));
  }, [filters.country, filters.includeMicro]);

  // ── Pie chart data ─────────────────────────────────────────────────────

  const pieData: ChartData<'pie'> = {
    labels: fuelData.map((r) => r.fuel),
    datasets: [{
      data:            fuelData.map((r) => r.generation_mw),
      backgroundColor: fuelData.map((r) => fuelColorMap[r.fuel_code] ?? '#6c757d'),
      borderWidth: 1,
    }],
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#444', boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${(ctx.raw as number).toLocaleString()} MW`,
        },
      },
    },
  };

  // ── Pareto chart data ──────────────────────────────────────────────────
  // fuelData already comes sorted descending from the API

  const totalMw = fuelData.reduce((s, r) => s + r.generation_mw, 0);
  let cumulative = 0;
  const cumulativePct = fuelData.map((r) => {
    cumulative += r.generation_mw;
    return parseFloat(((cumulative / totalMw) * 100).toFixed(1));
  });

  const paretoData: ChartData<'bar'> = {
    labels: fuelData.map((r) => r.fuel),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Capacity (MW)',
        data: fuelData.map((r) => r.generation_mw),
        backgroundColor: fuelData.map((r) => fuelColorMap[r.fuel_code] ?? '#6c757d'),
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Cumulative %',
        data: cumulativePct,
        borderColor: '#dc3545',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: 'y2',
        order: 1,
      } as any,
    ],
  };

  const paretoOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#444', boxWidth: 12 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { color: '#444', maxRotation: 45 }, grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { color: '#444', callback: (v) => Number(v).toLocaleString() },
        title: { display: true, text: 'Capacity (MW)', color: '#666' },
      },
      y2: {
        position: 'right',
        min: 0, max: 100,
        ticks: { color: '#dc3545', callback: (v) => `${v}%` },
        title: { display: true, text: 'Cumulative %', color: '#dc3545' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  // ── Country × Fuel pivot table ─────────────────────────────────────────

  // Sorted unique fuel columns (by total capacity descending)
  const fuelCols = fuelData.map((r) => r.fuel); // already sorted desc

  // Build map: countryCode → fuel → capacity
  const pivot = new Map<string, { name: string; byFuel: Map<string, number>; total: number }>();
  crossData.forEach(({ country_long, country_code, fuel, capacity_mw }) => {
    if (!pivot.has(country_code)) {
      pivot.set(country_code, { name: country_long, byFuel: new Map(), total: 0 });
    }
    const entry = pivot.get(country_code)!;
    entry.byFuel.set(fuel, (entry.byFuel.get(fuel) ?? 0) + Number(capacity_mw));
    entry.total += Number(capacity_mw);
  });

  // Sort countries by total capacity descending, take top 50
  const tableRows = Array.from(pivot.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 50);

  return (
    <div className="d-flex gap-3 py-3 align-items-start">

      {/* ── Sidebar filter ───────────────────────────────────────────── */}
      <div className="d-none d-md-block" style={{ width: '240px', flexShrink: 0 }}>
        <SidebarFilter onFilterChange={setFilters} disableFuel />
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-grow-1">
        {filters.country && (
          <div className="mb-2">
            <Badge bg="primary">Filtered: {filters.country}{filters.includeMicro ? ' · incl. micro' : ''}</Badge>
          </div>
        )}

      {/* ── Charts row ──────────────────────────────────────────────── */}
      <Row className="g-3 mb-3">
        {/* Pie */}
        <Col md={5}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white fw-semibold">
              Capacity by Fuel Type
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              {loadingFuel
                ? <Spinner animation="border" variant="primary" />
                : fuelData.length
                  ? <Pie data={pieData} options={pieOptions} />
                  : <p className="text-muted">No data available.</p>
              }
            </Card.Body>
          </Card>
        </Col>

        {/* Pareto */}
        <Col md={7}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white fw-semibold">
              Pareto — Capacity by Fuel Type
            </Card.Header>
            <Card.Body style={{ minHeight: '380px' }}>
              {loadingFuel
                ? <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" variant="primary" /></div>
                : fuelData.length
                  ? <Bar data={paretoData} options={paretoOptions} style={{ height: '100%' }} />
                  : <p className="text-muted">No data available.</p>
              }
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Country × Fuel table ─────────────────────────────────────── */}
      <Card>
        <Card.Header className="bg-primary text-white fw-semibold">
          Country Capacity by Fuel Type (MW) — Top 50 Countries
        </Card.Header>
        <Card.Body className="p-0">
          {loadingCross
            ? <div className="d-flex justify-content-center py-4"><Spinner animation="border" variant="primary" /></div>
            : (
              <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
                <Table bordered size="sm" className="mb-0" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <thead className="table-primary" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                    <tr>
                      <th style={{ position: 'sticky', left: 0, background: '#cfe2ff', zIndex: 3, minWidth: '150px' }}>
                        Country
                      </th>
                      <th className="text-end">Total</th>
                      {fuelCols.map((f) => (
                        <th key={f} className="text-end">{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(({ name, byFuel, total }) => (
                      <tr key={name}>
                        <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, fontWeight: 500 }}>
                          {name}
                        </td>
                        <td className="text-end fw-semibold">{fmt(Math.round(total))}</td>
                        {fuelCols.map((f) => (
                          <td key={f} className="text-end text-muted">
                            {fmt(byFuel.get(f))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )
          }
        </Card.Body>
      </Card>

      </div> {/* end flex-grow-1 main content */}
    </div>
  );
}
