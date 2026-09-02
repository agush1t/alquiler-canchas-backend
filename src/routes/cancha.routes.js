const { Router } = require('express');
const controller = require('../controllers/cancha.controller');
const validate = require('../middlewares/validate');
const {
  createCanchaSchema,
  updateCanchaSchema,
  listCanchasQuerySchema,
} = require('../validators/cancha.validator');

const router = Router();

// GET /api/canchas?sportType=&location=&minPrice=&maxPrice=&isActive=&search=&page=&limit=&sort=pricePerHour:asc
router.get('/', validate(listCanchasQuerySchema, 'query'), controller.getCanchas);

router.get('/:id', controller.getCanchaById);

router.post('/', validate(createCanchaSchema, 'body'), controller.createCancha);

router.put('/:id', validate(updateCanchaSchema, 'body'), controller.updateCancha);

router.delete('/:id', controller.deleteCancha);

module.exports = router;
