import { sqliteTable, text, real, integer, numeric } from 'drizzle-orm/sqlite-core';
import { InferSelectModel } from 'drizzle-orm';

// Export types for the database objects to use in the application
export type Facility = InferSelectModel<typeof facilitiesView>;
export type Capacity = InferSelectModel<typeof capacityByCountry>;
export type Generation = InferSelectModel<typeof generationByCountry>;



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


// Capacity by country view
export const capacityByCountry = sqliteTable('vw_country_capacity', {
  country_long: text('country_long').notNull(),
  country_code: text('country_code').notNull(),
  capacity_mw : integer('capacity_mw').notNull(),
});


// Generation by country view
export const generationByCountry = sqliteTable('vw_generation_by_country', {
  country_code: text('country_code').notNull(),
  year: integer('year').notNull(),
  total_generation: real('total_generation'),
});

export interface FuelCapacityWithName {
  fuel_code: number;
  fuel: string;           // e.g. "Solar", "Wind"
  generation_mw: number;
}
