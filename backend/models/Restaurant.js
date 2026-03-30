const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  location: { type: String, required: true },
  cuisine: { type: String, default: 'Multi-cuisine' },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  deliveryTime: { type: String, default: '30-45 min' },
  minOrder: { type: Number, default: 100 },
  isOpen: { type: Boolean, default: true },
  fssaiLicense: { type: String, default: '' }, // 14-digit FSSAI license
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
