const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  image:        { type: String, default: '' },
  description:  { type: String, default: '' },
  location:     { type: String, required: true },
  cuisine:      { type: String, default: 'Multi-cuisine' },
  rating:       { type: Number, default: 4.0, min: 0, max: 5 },
  deliveryTime: { type: String, default: '30-45 min' },
  minOrder:     { type: Number, default: 100 },
  fssaiLicense: { type: String, default: '' },
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Timing — stored as "HH:MM" in 24hr format (e.g. "09:00", "23:00")
  openTime:  { type: String, default: '09:00' },
  closeTime: { type: String, default: '23:00' },

  // isOpen is now COMPUTED from timing, but we keep the field for manual override
  // If manualOverride is true, use isOpen directly. Otherwise compute from time.
  isOpen:         { type: Boolean, default: true },
  manualOverride: { type: Boolean, default: false },
}, { timestamps: true });

/**
 * Virtual: isCurrentlyOpen
 * Computes open/closed based on current IST time vs openTime/closeTime
 */
restaurantSchema.virtual('isCurrentlyOpen').get(function () {
  if (this.manualOverride) return this.isOpen;

  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const currentMinutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();

  const [openH, openM]   = (this.openTime  || '09:00').split(':').map(Number);
  const [closeH, closeM] = (this.closeTime || '23:00').split(':').map(Number);

  const openMinutes  = openH  * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // Handle overnight hours (e.g. open 22:00, close 02:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
});

restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
