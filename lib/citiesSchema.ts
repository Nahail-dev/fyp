import { z } from 'zod';

export const CityRowSchema = z.object({
  uuid_id: z.string().uuid(),
  id: z.string().nullable().optional(),
  city: z.string().min(1),
  city_ascii: z.string().nullable().optional(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  country: z.string().min(1),
  iso2: z.string().nullable().optional(),
  iso3: z.string().nullable().optional(),
  admin_name: z.string().nullable().optional(),
  capital: z.string().nullable().optional(),
  population: z.coerce.number().nullable().optional(),
  continent: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
});

export const CitySearchQuerySchema = z.object({
  search: z.string().trim().min(2).max(80),
});

export const CityIdSchema = z.string().uuid();

export type CityRow = z.infer<typeof CityRowSchema>;
