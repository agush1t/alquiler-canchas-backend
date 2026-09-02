const reservaRepository = require('../repositories/reserva.repository');
const canchaRepository = require('../repositories/cancha.repository');
const ApiError = require('../utils/ApiError');
const { getIO } = require('../sockets');
const { timeToMinutes, addHours, rangesOverlap } = require('../utils/time');

class ReservaService {
  /**
   * Crea una reserva:
   * 1. Para cada cancha pedida, calcula su franja horaria (startTime -> startTime + quantity hs).
   * 2. Verifica que esa franja esté dentro del horario de apertura/cierre de la cancha.
   * 3. Verifica que NO se superponga con ninguna reserva activa existente para esa
   *    misma cancha y fecha (la consulta avanzada clave del sistema).
   * 4. Si todo es válido, persiste la reserva (solo ObjectId + quantity) y emite
   *    eventos realtime para que cualquier vista conectada vea la franja ocupada.
   */
  async createReserva(data) {
    const { date, startTime, canchas: requestedCanchas } = data;

    const canchaDocs = await Promise.all(
      requestedCanchas.map(async (item) => {
        const cancha = await canchaRepository.getById(item.cancha);
        if (!cancha) {
          throw ApiError.badRequest(`Cancha ${item.cancha} no existe`);
        }
        if (!cancha.isActive) {
          throw ApiError.badRequest(`Cancha "${cancha.name}" no está activa`);
        }

        const itemEndTime = addHours(startTime, item.quantity);

        // La franja debe caer dentro del horario de funcionamiento
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(itemEndTime);
        const openMinutes = cancha.openingHour * 60;
        const closeMinutes = cancha.closingHour * 60;
        if (startMinutes < openMinutes || endMinutes > closeMinutes) {
          throw ApiError.badRequest(
            `"${cancha.name}" abre de ${cancha.openingHour}:00 a ${cancha.closingHour}:00, fuera de ese rango no se puede reservar`
          );
        }

        // Buscar reservas activas de esa cancha en esa fecha y chequear solapamiento
        const existingReservas = await reservaRepository.getActiveByCanchaAndDate(
          item.cancha,
          date
        );

        for (const existing of existingReservas) {
          const existingItem = existing.canchas.find(
            (c) => c.cancha.toString() === item.cancha
          );
          if (!existingItem) continue;
          const existingEndTime = addHours(existing.startTime, existingItem.quantity);

          if (rangesOverlap(startTime, itemEndTime, existing.startTime, existingEndTime)) {
            throw ApiError.conflict(
              `"${cancha.name}" ya está reservada de ${existing.startTime} a ${existingEndTime} el ${date}`
            );
          }
        }

        return { cancha, endTime: itemEndTime };
      })
    );

    // Todas las validaciones pasaron: persistimos la reserva
    const reserva = await reservaRepository.create(data);
    const populated = await reservaRepository.getById(reserva._id, {
      populateCanchas: true,
    });

    // Notificar en tiempo real: la reserva creada y, por cada cancha, su franja recién ocupada
    const io = getIO();
    io.emit('reserva:created', populated);
    canchaDocs.forEach(({ cancha, endTime }) => {
      io.emit('cancha:slotReservado', {
        cancha: cancha._id,
        canchaName: cancha.name,
        date,
        startTime,
        endTime,
      });
    });

    return populated;
  }

  async getReservaById(id) {
    const reserva = await reservaRepository.getById(id, {
      populateCanchas: true,
    });
    if (!reserva) throw ApiError.notFound('Reserva no encontrada');
    return reserva;
  }

  async listReservas(query) {
    const { status, clientEmail, date, page, limit, sort } = query;

    const filter = {};
    if (status) filter.status = status;
    if (clientEmail) filter.clientEmail = clientEmail.toLowerCase();
    if (date) filter.date = date;

    let sortObj = { date: -1, startTime: 1 };
    if (sort) {
      const [field, direction] = sort.split(':');
      sortObj = { [field]: direction === 'asc' ? 1 : -1 };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      reservaRepository.getMany(filter, {
        skip,
        limit,
        sort: sortObj,
        populateCanchas: true,
      }),
      reservaRepository.countByFilter(filter),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async updateStatus(id, status) {
    const updated = await reservaRepository.updateStatus(id, status);
    if (!updated) throw ApiError.notFound('Reserva no encontrada');
    getIO().emit('reserva:statusChanged', updated);
    return updated;
  }

  /**
   * Devuelve, para una cancha y fecha dadas, la lista de franjas horarias
   * ya ocupadas por reservas activas. Es la consulta que alimentaría
   * un calendario/grilla de disponibilidad en el frontend.
   */
  async getDisponibilidad(canchaId, date) {
    const cancha = await canchaRepository.getById(canchaId);
    if (!cancha) throw ApiError.notFound('Cancha no encontrada');

    const reservas = await reservaRepository.getActiveByCanchaAndDate(canchaId, date);

    const occupiedSlots = reservas
      .map((r) => {
        const item = r.canchas.find((c) => c.cancha.toString() === canchaId);
        if (!item) return null;
        return {
          startTime: r.startTime,
          endTime: addHours(r.startTime, item.quantity),
          reservationId: r._id,
        };
      })
      .filter(Boolean)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    return {
      cancha: { _id: cancha._id, name: cancha.name },
      date,
      openingHour: cancha.openingHour,
      closingHour: cancha.closingHour,
      occupiedSlots,
    };
  }
}

module.exports = new ReservaService();
