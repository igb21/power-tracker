'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import { Card, Form, Table, Badge, Spinner, Offcanvas, Button } from 'react-bootstrap';
import { SlidersHorizontal } from 'lucide-react';
import { DataCenter } from '@/lib/dbSchema';

const DynamicMap = dynamic(() => import('./dc-map'), { ssr: false });

// Stage badge colors (matching map marker colors)
const STAGE_STYLE: Record<string, { bg: string; color: string }> = {
  'Active':                 { bg: '#6f42c1', color: '#fff' },
  'Construction':           { bg: '#fd7e14', color: '#fff' },
  'Announcement':           { bg: '#ffc107', color: '#212529' },
  'Land Bank':              { bg: '#20c997', color: '#fff' },
  'Delayed':                { bg: '#6c757d', color: '#fff' },
  'Cancelled':              { bg: '#dc3545', color: '#fff' },
  'Not Approved/Withdrawn': { bg: '#dc3545', color: '#fff' },
};

type SortCol = 'name' | 'operator' | 'stage' | 'capacity_mw' | 'state' | 'activation_date';

export default function DataCentersPage() {
  const [allData, setAllData]       = useState<DataCenter[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters — reactive, applied client-side instantly
  const [operator, setOperator] = useState('');
  const [stage,    setStage]    = useState('');
  const [aiOnly,   setAiOnly]   = useState(false);

  // Table sort
  const [sortCol, setSortCol] = useState<SortCol>('capacity_mw');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Fetch all data centers once on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_REST_API_KEY;
    if (!apiKey) return;
    fetch('/api/data-centers', { headers: { 'x-api-key': apiKey } })
      .then((r) => r.json())
      .then((j) => setAllData(j.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Unique operator + stage lists derived from the full dataset
  const operators = useMemo(
    () => Array.from(new Set(allData.map((d) => d.operator).filter(Boolean))).sort() as string[],
    [allData],
  );
  const stages = useMemo(
    () => Array.from(new Set(allData.map((d) => d.stage).filter(Boolean))).sort() as string[],
    [allData],
  );

  // Client-side filtered data
  const filtered = useMemo(() => {
    let data = allData;
    if (operator) data = data.filter((d) => d.operator === operator);
    if (stage)    data = data.filter((d) => d.stage    === stage);
    if (aiOnly)   data = data.filter((d) => d.is_ai    === 1);
    return data;
  }, [allData, operator, stage, aiOnly]);

  // Sorted table rows
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? (sortDir === 'asc' ? '\uffff' : '');
      const bv = b[sortCol] ?? (sortDir === 'asc' ? '\uffff' : '');
      if (av < bv) return sortDir === 'asc' ? -1 :  1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  function handleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'capacity_mw' ? 'desc' : 'asc');
    }
  }

  function sortIndicator(col: SortCol) {
    if (col !== sortCol) return null;
    return <span className="ms-1 text-white-50">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  }

  const activeFilterCount = [operator, stage, aiOnly].filter(Boolean).length;

  // Filter controls — rendered in both the desktop sidebar and the mobile offcanvas
  const filterControls = loading ? (
    <p className="text-muted small mb-0">Loading...</p>
  ) : (
    <div className="d-flex flex-column gap-3">
      <Form.Group>
        <Form.Label className="fw-medium small">Operator</Form.Label>
        <Form.Select size="sm" value={operator} onChange={(e) => setOperator(e.target.value)}>
          <option value="">All</option>
          {operators.map((op) => <option key={op} value={op}>{op}</option>)}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label className="fw-medium small">Stage</Form.Label>
        <Form.Select size="sm" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All</option>
          {stages.map((s) => <option key={s} value={s}>{s}</option>)}
        </Form.Select>
      </Form.Group>

      <Form.Check
        type="checkbox"
        id="aiOnly"
        label="AI Facilities only"
        checked={aiOnly}
        onChange={(e) => setAiOnly(e.target.checked)}
      />

      {activeFilterCount > 0 && (
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => { setOperator(''); setStage(''); setAiOnly(false); }}
        >
          Clear Filters
        </Button>
      )}

      {/* Summary stats */}
      <div className="border-top pt-2 text-muted small">
        <div>{filtered.length} of {allData.length} facilities</div>
        <div>{filtered.filter((d) => d.is_ai === 1).length} AI facilities</div>
        <div>{filtered.reduce((sum, d) => sum + (d.capacity_mw ?? 0), 0).toLocaleString()} MW total</div>
      </div>
    </div>
  );

  return (
    <div className="d-flex gap-3 py-3 align-items-start">

      {/* Mobile filter drawer */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-semibold">Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {filterControls}
          <div className="mt-3">
            <Button variant="primary" className="w-100" onClick={() => setShowFilters(false)}>
              Done
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <div className="d-none d-md-block" style={{ width: '220px', flexShrink: 0 }}>
        <Card>
          <Card.Header className="bg-primary text-white fw-semibold">Filters</Card.Header>
          <Card.Body>{filterControls}</Card.Body>
        </Card>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-grow-1">

        {/* Map */}
        <Card className="mb-3">
          <Card.Header className="bg-primary text-white fw-semibold d-flex justify-content-between align-items-center">
            <span>US Data Center Map</span>
            <div className="d-flex align-items-center gap-2">
              {!loading && (
                <span className="fw-normal small opacity-75">
                  {filtered.length} facilit{filtered.length === 1 ? 'y' : 'ies'}
                  {activeFilterCount > 0 && ' (filtered)'}
                </span>
              )}
              {/* Mobile filter toggle */}
              <Button
                variant="light"
                size="sm"
                className="d-md-none d-flex align-items-center gap-1 py-0 px-2"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={13} />
                <span className="small">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge bg="primary" className="ms-1" style={{ fontSize: '10px' }}>
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0 overflow-hidden">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '420px' }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <DynamicMap facilities={filtered} />
            )}
          </Card.Body>
        </Card>

        {/* Table */}
        <Card>
          <Card.Header className="bg-primary text-white fw-semibold">
            Data Center List
          </Card.Header>
          <div className="table-responsive">
            <Table striped hover size="sm" className="mb-0 small">
              <thead>
                <tr>
                  {(
                    [
                      { col: 'name',            label: 'Name' },
                      { col: 'operator',        label: 'Operator' },
                      { col: 'stage',           label: 'Stage' },
                      { col: 'state',           label: 'Location' },
                      { col: 'capacity_mw',     label: 'Capacity (MW)' },
                      { col: 'activation_date', label: 'Activation' },
                    ] as { col: SortCol; label: string }[]
                  ).map(({ col, label }) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      style={{ cursor: 'pointer', userSelect: 'none', background: '#0d6efd', color: '#fff', whiteSpace: 'nowrap' }}
                    >
                      {label}{sortIndicator(col)}
                    </th>
                  ))}
                  <th style={{ background: '#0d6efd', color: '#fff' }}>AI</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((dc) => {
                  const stageStyle = STAGE_STYLE[dc.stage ?? ''];
                  return (
                    <tr key={dc.id}>
                      <td>{dc.name ?? '—'}</td>
                      <td>{dc.operator ?? '—'}</td>
                      <td>
                        {dc.stage ? (
                          <span
                            className="badge"
                            style={{
                              background: stageStyle?.bg ?? '#6c757d',
                              color:      stageStyle?.color ?? '#fff',
                              fontSize:   '10px',
                            }}
                          >
                            {dc.stage}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {[dc.city, dc.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="text-end">
                        {dc.capacity_mw != null ? dc.capacity_mw.toLocaleString() : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>
                        {dc.activation_date ?? '—'}
                      </td>
                      <td>
                        {dc.is_ai === 1 && (
                          <Badge style={{ background: '#6f42c1', fontSize: '10px' }}>AI</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No data centers match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
