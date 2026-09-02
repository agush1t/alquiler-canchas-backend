const canchaService = require('../services/cancha.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');

const createCancha = asyncHandler(async (req, res) => {
  const cancha = await canchaService.createCancha(req.body);
  created(res, cancha);
});

const getCanchas = asyncHandler(async (req, res) => {
  const { items, meta } = await canchaService.listCanchas(req.query);
  ok(res, items, meta);
});

const getCanchaById = asyncHandler(async (req, res) => {
  const cancha = await canchaService.getCanchaById(req.params.id);
  ok(res, cancha);
});

const updateCancha = asyncHandler(async (req, res) => {
  const cancha = await canchaService.updateCancha(req.params.id, req.body);
  ok(res, cancha);
});

const deleteCancha = asyncHandler(async (req, res) => {
  await canchaService.deleteCancha(req.params.id);
  ok(res, { message: 'Cancha eliminada correctamente' });
});

module.exports = {
  createCancha,
  getCanchas,
  getCanchaById,
  updateCancha,
  deleteCancha,
};
