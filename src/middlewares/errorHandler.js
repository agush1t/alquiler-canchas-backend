const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details || undefined,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: `Valor inválido para el campo "${err.path}"`,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en base de datos',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
