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




// Ember yearly electricity data (generation, capacity, demand, emissions by country+year+variable)
export const emberYearly = sqliteTable('ember_yearly', {
  country_code: text('country_code').notNull(),
  year:         integer('year').notNull(),
  category:     text('category').notNull(),    // e.g. "Electricity generation"
  subcategory:  text('subcategory').notNull(), // e.g. "Fuel", "Aggregate fuel", "Total"
  variable:     text('variable').notNull(),    // e.g. "Solar", "Wind", "Total Generation"
  unit:         text('unit').notNull(),        // e.g. "TWh", "GW", "mtCO2"
  value:        real('value'),
});

export type EmberYearly = InferSelectModel<typeof emberYearly>;

export interface FuelCapacityWithName {
  fuel_code: number;
  fuel: string;           // e.g. "Solar", "Wind"
  generation_mw: number;
}

// Aterio US data centers (free sample, 297 facilities)
export const dataCenters = sqliteTable('data_centers', {
  id:              text('id').primaryKey(),         // ATERIO_DATA_CENTER_UID
  name:            text('name'),                    // DATA_CENTER_BUILDING_NAME
  operator:        text('operator'),                // PROVIDER_NAME
  stage:           text('stage'),                   // DATA_CENTER_STAGE
  is_ai:           integer('is_ai').default(0),     // FLG_AI_FACILITY = 'Y' → 1
  city:            text('city'),                    // CITY_NAME
  state:           text('state'),                   // STATE_CODE
  latitude:        real('latitude').notNull(),
  longitude:       real('longitude').notNull(),
  capacity_mw:     real('capacity_mw'),             // SELECTED_POWER_CAPACITY_MW
  announced_date:  text('announced_date'),          // DATA_CENTER_ANNOUNCED_DATE
  activation_date: text('activation_date'),         // DATA_CENTER_ACTIVATION_DATE or ESTIMATED_ACTIVE_DATE_BY
  utility:         text('utility'),                 // UTILITY_NAME
});

export type DataCenter = InferSelectModel<typeof dataCenters>;
