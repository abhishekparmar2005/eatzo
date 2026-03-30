const mongoose = require('mongoose');

// Each variant has a name (Half/Full) and a price
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Half", "Full"
  price: { type: Number, required: true },
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // base price (used when no variants)
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: 'Main Course' },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  variants: { type: [variantSchema], default: [] }, // optional Half/Full etc.
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
