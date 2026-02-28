      import { sql, eq, asc, gte, and, inArray } from 'drizzle-orm';
      import { db } from './dbConnection';
      import { countries, fuelSources, facilities, capacityByCountry, generationByCountry, facilitiesView, dataCenters } from './dbSchema';



      // Function to get filter metadata
      // Returns an object with countries, fuel sources
      export async function getFilterMetadata() {
        try {
          
          // Countries
          const countryList = await db
            .select({ code: countries.country_code, country: countries.country_long })
            .from(countries)
            .orderBy(asc(countries.country_long));

          // Fuel Sources
          const fuelList = await db
            .select({ code: fuelSources.fuel_code, fuelSource: fuelSources.fuel })
            .from(fuelSources)
            .orderBy(asc(fuelSources.fuel));


          const result = {
            countries: countryList,
            fuelSources: fuelList,
          };

          // Debug output
          if (process.env.DEBUG) {
            console.log('Filter metadata result:', JSON.stringify(result, null, 2));
          }

          return result;
        } catch (error: any) {
          console.error('ORM error in getFilterMetadata:', error?.message || error);
          throw error;
        }
      }


      // Function to get facilitiesView by country code and optionally, by fuel code and including micro facilities
      // accepts country code and fuel code as optional parameters
      export async function getFacilities(countryCode: string | null, fuelCode: number | null, includeMicro: boolean = false) {
        try {
          const filters = [];

          // If countryCode is provided, filter by country code
          if (countryCode) {
            filters.push(eq(facilitiesView.country_code, countryCode));
          }

          // If fuelCode (integer) is provided, filter by fuel code
          if (fuelCode !== null) {
            filters.push(eq(facilitiesView.fuel_code, fuelCode));
          }

          // If not including micro facilities, filter out those with capacity less than 50 MW
          if (!includeMicro) {
            filters.push(gte(facilitiesView.capacity_mw, 50));
            }

        // Execute the query with the filters
          const query = filters.length > 0
            ? db.select().from(facilitiesView).where(and(...filters))
            : db.select().from(facilitiesView);

          const result = await query;

          // Debug output
          if (process.env.DEBUG) {
            console.log('Facilities query result:', result);
          }

          return result;
        } catch (error: any) {
          console.error('ORM error in getFacilities:', error?.message || error);
          throw error;
        }
      }


      // This function fetches total power capacity (in MW) for each country,
      // optionally filtered by a specific fuel type (like solar, wind, etc.)
      export async function getCountryCapacity(fuelCode?: number | null) {
        try {
          const result = await db
            .select({
              // Select the readable country name
              country_long: countries.country_long,

              // Select the country code (e.g. "USA")
              country_code: countries.country_code,

              // Calculate the total capacity in megawatts, rounded to a whole number
              capacity_mw: sql`ROUND(SUM(${facilities.capacity_mw}), 0)`.as('capacity_mw'),
            })
            // Start from the facilities table (where each power plant is listed)
            .from(facilities)

            // Join with the countries table to get readable country names
            .innerJoin(countries, eq(facilities.country_code, countries.country_code))

            // If a fuelCode is provided, filter to only include that fuel type
            // If fuelCode is null or undefined, skip filtering and include all fuels
            .where(fuelCode ? eq(facilities.fuel_code, fuelCode) : undefined)

            // Group results by country so we get one row per country
            .groupBy(countries.country_code, countries.country_long)

            // Sort countries by total capacity, highest first
            .orderBy(sql`SUM(${facilities.capacity_mw}) DESC`);

          // Debug output
          if (process.env.DEBUG) {
            console.debug('getCountryCapacity query result:', result);
          }

          // Return the final result
          return result;
        } catch (error: any) {
          // Debug output
          if (process.env.DEBUG) {
            console.debug('ORM getCountryCapacity error:', error?.message || error);
          }

          // Re-throw the error so it can be handled upstream
          throw error;
        }
      }



      // Function to get generation data by country
      // Accepts an array of country codes and returns total generation by year
      export async function getCountryGeneration(countryCodes: string[]) {
        try {

          // Validate countryCodes
          if (countryCodes.length === 0) return [];

          // Execute query to get generation by country and year
          const result = await db
            .select()
            .from(generationByCountry)
            .where(inArray(generationByCountry.country_code, countryCodes))
            .orderBy(generationByCountry.country_code, generationByCountry.year);

            // Debug output
          if (process.env.DEBUG) {
            console.debug('getCountryGeneration query result:', result);
          }

          // return result;
          return result;
        } catch (error: any) {
          if (process.env.DEBUG) {
            console.debug('ORM getCountryGeneration error:',  error?.message || error);
          }
          throw error;
        }
      }


      //  function to get total power capacity (in MW) grouped by fuel type,
      //  Optionally filtered by country and micro-facility threshold.
      export async function getFuelTypeCapacity(countryCode?: string | null, includeMicro = false) {
        try {
          const filters = [];
          if (countryCode) filters.push(eq(facilities.country_code, countryCode));
          if (!includeMicro) filters.push(gte(facilities.capacity_mw, 50));

          const result = await db
            .select({
              fuel_code: fuelSources.fuel_code,
              fuel: fuelSources.fuel,
              generation_mw: sql`ROUND(SUM(${facilities.capacity_mw}), 0)`.as('capacity_mw'),
            })
            .from(facilities)
            .innerJoin(fuelSources, eq(facilities.fuel_code, fuelSources.fuel_code))
            .where(filters.length > 0 ? and(...filters) : undefined)
            .groupBy(facilities.fuel_code)
            .orderBy(sql`SUM(${facilities.capacity_mw}) DESC`);

          if (process.env.DEBUG) {
            console.debug('getFuelTypeCapacity query result:', result);
          }

          return result;
        } catch (error: any) {
          if (process.env.DEBUG) {
            console.debug('ORM getFuelTypeCapacity error:', error?.message || error);
          }
          throw error;
        }
      }


    

    // Returns capacity in MW grouped by both country AND fuel type,
    // used for the cross-tabulated country × fuel table.
    // Optionally filtered by country and micro-facility threshold.
    export async function getCountryFuelCapacity(countryCode?: string | null, includeMicro = false) {
      try {
        const filters = [];
        if (countryCode) filters.push(eq(facilities.country_code, countryCode));
        if (!includeMicro) filters.push(gte(facilities.capacity_mw, 50));

        const result = await db
          .select({
            country_long: countries.country_long,
            country_code: countries.country_code,
            fuel:      fuelSources.fuel,
            fuel_code: fuelSources.fuel_code,
            capacity_mw: sql`ROUND(SUM(${facilities.capacity_mw}), 0)`.as('capacity_mw'),
          })
          .from(facilities)
          .innerJoin(countries,    eq(facilities.country_code, countries.country_code))
          .innerJoin(fuelSources,  eq(facilities.fuel_code,    fuelSources.fuel_code))
          .where(filters.length > 0 ? and(...filters) : undefined)
          .groupBy(
            countries.country_code,
            countries.country_long,
            fuelSources.fuel_code,
            fuelSources.fuel,
          )
          .orderBy(countries.country_long, fuelSources.fuel);

        return result;
      } catch (error: any) {
        console.error('ORM error in getCountryFuelCapacity:', error?.message || error);
        throw error;
      }
    }


    // Returns all AI/hyperscale data centers, sorted by capacity descending.
    export async function getDataCenters() {
      try {
        const result = await db
          .select()
          .from(dataCenters)
          .orderBy(sql`${dataCenters.capacity_mw} DESC NULLS LAST`);

        return result;
      } catch (error: any) {
        console.error('ORM error in getDataCenters:', error?.message || error);
        throw error;
      }
    }


    // Function to update a facility by its gppd_idnr.
    // id - The facility's gppd_idnr
    // data - Partial update payload (excluding gppd_idnr)
    export async function updateFacility(
      id: string,
      data: Partial<Omit<typeof facilities.$inferInsert, 'gppd_idnr'>>
    ) {
      try {
        const result = await db
          .update(facilities)
          .set(data)
          .where(eq(facilities.gppd_idnr, id));

        return result;
      } catch (err: any) {
        console.error(`Database update failed for gppd_idnr=${id}:`, err);
        throw new Error(`Database update failed for gppd_idnr=${id}:`, err);
      }
    }
