const { Router } = require('express');
const controller = require('../controllers/reserva.controller');
const validate = require('../middlewares/validate');
const {
  createReservaSchema,
  updateReservaStatusSchema,
  listReservasQuerySchema,
} = require('../validators/reserva.validator');
const { disponibilidadQuerySchema } = require('../validators/cancha.validator');

const router = Router();

router.get('/', validate(listReservasQuerySchema, 'query'), controller.getReservas);

// GET /api/reservas/disponibilidad/:canchaId?date=YYYY-MM-DD
// Devuelve las franjas horarias ya ocupadas de una cancha en una fecha dada
router.get(
  '/disponibilidad/:canchaId',
  validate(disponibilidadQuerySchema, 'query'),
  controller.getDisponibilidad
);

router.get('/:id', controller.getReservaById);

router.post('/', validate(createReservaSchema, 'body'), controller.createReserva);

router.patch(
  '/:id/status',
  validate(updateReservaStatusSchema, 'body'),
  controller.updateReservaStatus
);

module.exports = router;
