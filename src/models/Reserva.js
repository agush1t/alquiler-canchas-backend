const mongoose = require('mongoose');

const { Schema } = mongoose;

// Sub-documento: SOLO referencia (ObjectId) + quantity (horas reservadas),
// nunca el objeto de cancha completo embebido.
const reservedCanchaSchema = new Schema(
  {
    cancha: {
      type: Schema.Types.ObjectId,
      ref: 'Cancha',
      required: true,
    },
    quantity: {
      type: Number, // cantidad de horas reservadas para esta cancha
      required: true,
      min: 1,
      max: 12,
      default: 1,
    },
  },
  { _id: false }
);

const reservaSchema = new Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    // Guardamos fecha y hora como strings simples ("YYYY-MM-DD" y "HH:mm")
    // para poder comparar horarios de forma directa y evitar líos de timezone.
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    canchas: {
      type: [reservedCanchaSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'La reserva debe incluir al menos una cancha.',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reservaSchema.index({ date: 1, 'canchas.cancha': 1 });

module.exports = mongoose.model('Reserva', reservaSchema);
