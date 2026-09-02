const { z } = require('zod');
const { SPORT_TYPES } = require('../models/Cancha');

const createCanchaSchema = z
  .object({
    name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
    sportType: z.enum(SPORT_TYPES, {
      errorMap: () => ({ message: `sportType debe ser uno de: ${SPORT_TYPES.join(', ')}` }),
    }),
    location: z.string().trim().min(2, 'La ubicación es requerida'),
    pricePerHour: z
      .number({ invalid_type_error: 'pricePerHour debe ser numérico' })
      .nonnegative(),
    description: z.string().trim().optional().default(''),
    openingHour: z.number().int().min(0).max(23).default(8),
    closingHour: z.number().int().min(0).max(23).default(23),
    isActive: z.boolean().optional().default(true),
  })
  .refine((data) => data.openingHour < data.closingHour, {
    message: 'openingHour debe ser menor que closingHour',
    path: ['closingHour'],
  });

// En update, todos los campos opcionales (por eso no reusamos el .refine directo)
const updateCanchaSchema = z.object({
  name: z.string().trim().min(3).optional(),
  sportType: z.enum(SPORT_TYPES).optional(),
  location: z.string().trim().min(2).optional(),
  pricePerHour: z.number().nonnegative().optional(),
  description: z.string().trim().optional(),
  openingHour: z.number().int().min(0).max(23).optional(),
  closingHour: z.number().int().min(0).max(23).optional(),
  isActive: z.boolean().optional(),
});

const listCanchasQuerySchema = z.object({
  sportType: z.enum(SPORT_TYPES).optional(),
  location: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  search: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z
    .string()
    .regex(/^[a-zA-Z]+:(asc|desc)$/, 'sort debe tener el formato campo:asc|desc')
    .optional(),
});

const disponibilidadQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe tener formato YYYY-MM-DD'),
});

module.exports = {
  createCanchaSchema,
  updateCanchaSchema,
  listCanchasQuerySchema,
  disponibilidadQuerySchema,
};
