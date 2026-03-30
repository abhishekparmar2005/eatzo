const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  image: String,
  quantity: Number,
  variant: { type: String, default: '' },
});

// NEW: each notification is a short message + timestamp
const notificationSchema = new mongoose.Schema({
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  restaurantName: String,
  items: [orderItemSchema],
  totalPrice:  { type: Number, required: true },

  // UPDATED: deliveryFee is now calculated dynamically (free if total ≥ 150)
  deliveryFee: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed',
  },

  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Payment Pending Verification', 'Paid', 'Failed'],
    default: 'Pending',
  },

  utrNumber:       { type: String, default: '' },
  isSuspicious:    { type: Boolean, default: false },
  suspiciousReason:{ type: String,  default: '' },
  upiPaidClickedAt:  { type: Date },
  iHavePaidClickedAt:{ type: Date },

  deliveryAddress: { type: String, default: '' },
  customerPhone:   { type: String, default: '' },
  customerNote:    { type: String, default: '' },

  // NEW: notification history (admin → user status updates)
  notifications: { type: [notificationSchema], default: [] },

  // NEW: estimated delivery time shown on order tracking
  estimatedDelivery: { type: String, default: '20–40 min' },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
