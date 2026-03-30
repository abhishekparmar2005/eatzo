const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  image: String,
  quantity: Number,
  variant: { type: String, default: '' }, // e.g. "Half" or "Full"
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  restaurantName: String,
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  deliveryFee: { type: Number, default: 30 },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Payment Pending Verification', 'Paid'],
    default: 'Pending',
  },
  deliveryAddress: { type: String, default: '' },
  paymentMethod: { type: String, default: 'COD' },
  customerPhone: { type: String, default: '' },
  customerNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
