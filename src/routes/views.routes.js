const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const canchaService = require('../services/cancha.service');
const reservaService = require('../services/reserva.service');

const router = Router();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Vista simple: lista de canchas + reservas de hoy, se actualiza en vivo vía Socket.io
router.get(
  '/canchas',
  asyncHandler(async (req, res) => {
    const { items: canchas } = await canchaService.listCanchas({ page: 1, limit: 50 });
    const today = todayStr();
    const { items: reservasHoy } = await reservaService.listReservas({
      date: today,
      page: 1,
      limit: 50,
    });

    res.render('canchas', {
      title: 'Canchas disponibles',
      canchas,
      reservasHoy,
      today,
    });
  })
);

module.exports = router;
