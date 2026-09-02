const reservaService = require('../services/reserva.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');

const createReserva = asyncHandler(async (req, res) => {
  const reserva = await reservaService.createReserva(req.body);
  created(res, reserva);
});

const getReservas = asyncHandler(async (req, res) => {
  const { items, meta } = await reservaService.listReservas(req.query);
  ok(res, items, meta);
});

const getReservaById = asyncHandler(async (req, res) => {
  const reserva = await reservaService.getReservaById(req.params.id);
  ok(res, reserva);
});

const updateReservaStatus = asyncHandler(async (req, res) => {
  const reserva = await reservaService.updateStatus(req.params.id, req.body.status);
  ok(res, reserva);
});

const getDisponibilidad = asyncHandler(async (req, res) => {
  const disponibilidad = await reservaService.getDisponibilidad(
    req.params.canchaId,
    req.query.date
  );
  ok(res, disponibilidad);
});

module.exports = {
  createReserva,
  getReservas,
  getReservaById,
  updateReservaStatus,
  getDisponibilidad,
};
