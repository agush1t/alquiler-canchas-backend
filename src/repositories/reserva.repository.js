const reservaDAO = require('../dao/reserva.dao');

class ReservaRepository {
  create(data) {
    return reservaDAO.create(data);
  }

  getById(id, options) {
    return reservaDAO.findById(id, options);
  }

  getMany(filter, options) {
    return reservaDAO.find(filter, options);
  }

  countByFilter(filter) {
    return reservaDAO.count(filter);
  }

  getActiveByCanchaAndDate(canchaId, date) {
    return reservaDAO.findActiveByCanchaAndDate(canchaId, date);
  }

  updateStatus(id, status) {
    return reservaDAO.updateStatusById(id, status);
  }

  remove(id) {
    return reservaDAO.deleteById(id);
  }
}

module.exports = new ReservaRepository();
