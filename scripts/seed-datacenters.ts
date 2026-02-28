/**
 * One-off seed script: imports Epoch AI frontier data centers CSV into SQLite.
 * Run with:  npx tsx scripts/seed-datacenters.ts
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH  = path.join(process.cwd(), 'lib', 'power_generation.db');
const CSV_PATH = path.join(process.cwd(), 'data', 'epoch-datacenters.csv');

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles quoted fields and "" escape for literal double-quotes inside fields.

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;                  // skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ── DMS → decimal degrees ─────────────────────────────────────────────────────
// Handles e.g. `32°35'25"N` or ` 101°18'43"W` (leading spaces tolerated)

function parseDMS(raw: string): number {
  const s = raw.trim();
  const m = s.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/i);
  if (!m) throw new Error(`Cannot parse DMS coordinate: "${raw}"`);
  const dec = parseInt(m[1]) + parseInt(m[2]) / 60 + parseFloat(m[3]) / 3600;
  return (m[4].toUpperCase() === 'S' || m[4].toUpperCase() === 'W') ? -dec : dec;
}

// ── Strip confidence tags ─────────────────────────────────────────────────────
// e.g. "Amazon #confident, Anthropic #speculative" → "Amazon, Anthropic"

function stripTags(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw
    .split(',')
    .map(s => s.replace(/#\w+/, '').trim())
    .filter(Boolean)
    .join(', ');
  return cleaned || null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const db = new Database(DB_PATH);

// Create table (idempotent)
db.exec(`
  CREATE TABLE IF NOT EXISTS data_centers (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    project      TEXT,
    address      TEXT,
    latitude     REAL NOT NULL,
    longitude    REAL NOT NULL,
    owner        TEXT,
    users        TEXT,
    capacity_mw  REAL,
    h100_equiv   REAL,
    capex_bn     REAL
  )
`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO data_centers
    (id, name, project, address, latitude, longitude, owner, users, capacity_mw, h100_equiv, capex_bn)
  VALUES
    (@id, @name, @project, @address, @latitude, @longitude, @owner, @users, @capacity_mw, @h100_equiv, @capex_bn)
`);

const lines = fs.readFileSync(CSV_PATH, 'utf-8').split('\n').filter(Boolean);
const header = lines[0]; // skip header row
const dataLines = lines.slice(1);

// Column indices from header:
// Handle,Title,Project,Address,Latitude,Longitude,Owner,Users,Investors,
// Construction companies,Energy companies,Current H100 equivalents,
// Current power (MW),Current total capital cost (2025 USD billions)
const COL = { id: 0, name: 1, project: 2, address: 3, lat: 4, lon: 5,
              owner: 6, users: 7, h100: 11, mw: 12, capex: 13 };

let inserted = 0, skipped = 0;

const insertMany = db.transaction(() => {
  for (const line of dataLines) {
    const cols = parseCSVLine(line);
    if (cols.length < 8) { skipped++; continue; }

    let latitude: number, longitude: number;
    try {
      latitude  = parseDMS(cols[COL.lat]);
      longitude = parseDMS(cols[COL.lon]);
    } catch (e) {
      console.warn(`Skipping row "${cols[COL.id]}": ${(e as Error).message}`);
      skipped++;
      continue;
    }

    const mwRaw = parseFloat(cols[COL.mw]);
    const h100Raw = parseFloat(cols[COL.h100]);
    const capexRaw = parseFloat(cols[COL.capex]);

    insert.run({
      id:          cols[COL.id],
      name:        cols[COL.name],
      project:     cols[COL.project] || null,
      address:     cols[COL.address] || null,
      latitude,
      longitude,
      owner:       stripTags(cols[COL.owner]),
      users:       stripTags(cols[COL.users]),
      capacity_mw: isNaN(mwRaw) || mwRaw === 0 ? null : mwRaw,
      h100_equiv:  isNaN(h100Raw) || h100Raw === 0 ? null : h100Raw,
      capex_bn:    isNaN(capexRaw) || capexRaw === 0 ? null : capexRaw,
    });
    inserted++;
  }
});

insertMany();
console.log(`✓ Done — ${inserted} rows inserted, ${skipped} skipped.`);
db.close();
