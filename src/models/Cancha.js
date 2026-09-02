const mongoose = require('mongoose');

const SPORT_TYPES = [
  'futbol5',
  'futbol7',
  'futbol11',
  'padel',
  'tenis',
  'basquet',
  'voley',
];

const canchaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sportType: {
      type: String,
      required: true,
      enum: SPORT_TYPES,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Horario de funcionamiento del predio para esta cancha (formato 0-23)
    openingHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 8,
    },
    closingHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 23,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

canchaSchema.index({ name: 'text', location: 'text' });

module.exports = mongoose.model('Cancha', canchaSchema);
module.exports.SPORT_TYPES = SPORT_TYPES;
