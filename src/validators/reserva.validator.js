const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const objectId = z.string().regex(objectIdRegex, 'Debe ser un ObjectId de Mongo válido');

const reservedCanchaSchema = z.object({
  cancha: objectId,
  quantity: z
    .number({ invalid_type_error: 'quantity (horas) debe ser numérico' })
    .int()
    .min(1, 'Mínimo 1 hora')
    .max(12, 'Máximo 12 horas')
    .default(1),
});

const createReservaSchema = z.object({
  clientName: z.string().trim().min(2, 'El nombre del cliente es requerido'),
  clientEmail: z.string().trim().email('Email inválido'),
  date: z.string().regex(dateRegex, 'date debe tener formato YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'startTime debe tener formato HH:mm (24hs)'),
  canchas: z.array(reservedCanchaSchema).min(1, 'Debe incluir al menos una cancha'),
  notes: z.string().trim().optional().default(''),
});

const updateReservaStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

const listReservasQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  clientEmail: z.string().trim().optional(),
  date: z.string().regex(dateRegex).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z
    .string()
    .regex(/^[a-zA-Z]+:(asc|desc)$/, 'sort debe tener el formato campo:asc|desc')
    .optional(),
});

module.exports = {
  createReservaSchema,
  updateReservaStatusSchema,
  listReservasQuerySchema,
};
