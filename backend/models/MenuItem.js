const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: 'Main Course' },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
