const canchaDAO = require('../dao/cancha.dao');

class CanchaRepository {
  create(data) {
    return canchaDAO.create(data);
  }

  getById(id) {
    return canchaDAO.findById(id);
  }

  getMany(filter, options) {
    return canchaDAO.find(filter, options);
  }

  countByFilter(filter) {
    return canchaDAO.count(filter);
  }

  update(id, data) {
    return canchaDAO.updateById(id, data);
  }

  remove(id) {
    return canchaDAO.deleteById(id);
  }
}

module.exports = new CanchaRepository();
