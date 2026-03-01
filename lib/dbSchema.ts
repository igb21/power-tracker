import { sqliteTable, text, real, integer, numeric } from 'drizzle-orm/sqlite-core';
import { InferSelectModel } from 'drizzle-orm';

// Export types for the database objects to use in the application
export type Facility = InferSelectModel<typeof facilitiesView>;



// Countries
export const countries = sqliteTable('countries', {
    country_code: text('country_code').primaryKey(),
    country_long: text('country_long'),

});

// Fuel sources
export const fuelSources = sqliteTable('fuel_sources', {
  fuel_code: integer('fuel_code').primaryKey(),
  fuel: text('fuel'),
});


// Facilities  
export const facilities = sqliteTable('facilities', {
  gppd_idnr: text('gppd_idnr').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  name: text('name').notNull(),
  capacity_mw: integer('capacity_mw'),
  owner: text('owner'),
  fuel_code: integer('fuel_code'),
  country_code: text('country_code'),
});

// facilites display view - denormalized view for easier querying
export const facilitiesView = sqliteTable('vw_facilities', {
  gppd_idnr: text('gppd_idnr').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  name: text('name').notNull(),
  capacity_mw: integer('capacity_mw'),
  owner: text('owner'),
  fuel_code: integer('fuel_code'),
  fuel: text('fuel'),
  country_code: text('country_code'),
  country_long: text('country_long'),
});



// AI / hyperscale data centers (Epoch AI dataset)
export const dataCenters = sqliteTable('data_centers', {
  id:           text('id').primaryKey(),          // Handle
  name:         text('name').notNull(),            // Title
  project:      text('project'),
  address:      text('address'),
  latitude:     real('latitude').notNull(),
  longitude:    real('longitude').notNull(),
  owner:        text('owner'),
  users:        text('users'),
  capacity_mw:  real('capacity_mw'),               // Current power (MW)
  h100_equiv:   real('h100_equiv'),                // Current H100 equivalents
  capex_bn:     real('capex_bn'),                  // Capital cost (2025 USD billions)
});

export type DataCenter = InferSelectModel<typeof dataCenters>;

export interface FuelCapacityWithName {
  fuel_code: number;
  fuel: string;           // e.g. "Solar", "Wind"
  generation_mw: number;
}
