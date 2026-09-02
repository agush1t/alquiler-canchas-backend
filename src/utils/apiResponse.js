function ok(res, data, meta = null, statusCode = 200) {
  const payload = { status: 'success', data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function created(res, data) {
  return ok(res, data, null, 201);
}

module.exports = { ok, created };
