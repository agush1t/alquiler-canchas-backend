const Reserva = require('../models/Reserva');

class ReservaDAO {
  async create(data) {
    return Reserva.create(data);
  }

  async findById(id, { populateCanchas = false } = {}) {
    const query = Reserva.findById(id);
    if (populateCanchas) query.populate('canchas.cancha');
    return query.exec();
  }

  async find(filter, { skip, limit, sort, populateCanchas = false } = {}) {
    let query = Reserva.find(filter);
    if (populateCanchas) query = query.populate('canchas.cancha');
    if (sort) query = query.sort(sort);
    if (typeof skip === 'number') query = query.skip(skip);
    if (typeof limit === 'number') query = query.limit(limit);
    return query.exec();
  }

  async count(filter) {
    return Reserva.countDocuments(filter);
  }

  /**
   * Trae, para una cancha y fecha puntual, todas las reservas activas
   * (no canceladas) que podrían solaparse. Es la base de la validación
   * de disponibilidad horaria.
   */
  async findActiveByCanchaAndDate(canchaId, date) {
    return Reserva.find({
      date,
      status: { $ne: 'cancelled' },
      'canchas.cancha': canchaId,
    });
  }

  async updateStatusById(id, status) {
    return Reserva.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('canchas.cancha');
  }

  async deleteById(id) {
    return Reserva.findByIdAndDelete(id);
  }
}

module.exports = new ReservaDAO();
