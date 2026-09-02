const canchaRepository = require('../repositories/cancha.repository');
const ApiError = require('../utils/ApiError');
const { getIO } = require('../sockets');

class CanchaService {
  async createCancha(data) {
    if (data.openingHour >= data.closingHour) {
      throw ApiError.badRequest(
        'openingHour debe ser menor que closingHour'
      );
    }
    const cancha = await canchaRepository.create(data);
    getIO().emit('cancha:created', cancha);
    return cancha;
  }

  async getCanchaById(id) {
    const cancha = await canchaRepository.getById(id);
    if (!cancha) throw ApiError.notFound('Cancha no encontrada');
    return cancha;
  }

  /**
   * Búsqueda avanzada: filtros por deporte, ubicación, precio, texto,
   * paginación y ordenamiento dinámico vía query params.
   */
  async listCanchas(query) {
    const { sportType, location, minPrice, maxPrice, search, isActive, page, limit, sort } =
      query;

    const filter = {};
    if (sportType) filter.sportType = sportType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerHour = {};
      if (minPrice !== undefined) filter.pricePerHour.$gte = minPrice;
      if (maxPrice !== undefined) filter.pricePerHour.$lte = maxPrice;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, direction] = sort.split(':');
      sortObj = { [field]: direction === 'asc' ? 1 : -1 };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      canchaRepository.getMany(filter, { skip, limit, sort: sortObj }),
      canchaRepository.countByFilter(filter),
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

  async updateCancha(id, data) {
    if (
      data.openingHour !== undefined &&
      data.closingHour !== undefined &&
      data.openingHour >= data.closingHour
    ) {
      throw ApiError.badRequest('openingHour debe ser menor que closingHour');
    }
    const updated = await canchaRepository.update(id, data);
    if (!updated) throw ApiError.notFound('Cancha no encontrada');
    getIO().emit('cancha:updated', updated);
    return updated;
  }

  async deleteCancha(id) {
    const deleted = await canchaRepository.remove(id);
    if (!deleted) throw ApiError.notFound('Cancha no encontrada');
    getIO().emit('cancha:deleted', { _id: id });
    return deleted;
  }
}

module.exports = new CanchaService();
