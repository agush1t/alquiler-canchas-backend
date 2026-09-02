const Cancha = require('../models/Cancha');

class CanchaDAO {
  async create(data) {
    return Cancha.create(data);
  }

  async findById(id) {
    return Cancha.findById(id);
  }

  async find(filter, { skip, limit, sort } = {}) {
    let query = Cancha.find(filter);
    if (sort) query = query.sort(sort);
    if (typeof skip === 'number') query = query.skip(skip);
    if (typeof limit === 'number') query = query.limit(limit);
    return query.exec();
  }

  async count(filter) {
    return Cancha.countDocuments(filter);
  }

  async updateById(id, data) {
    return Cancha.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return Cancha.findByIdAndDelete(id);
  }
}

module.exports = new CanchaDAO();
