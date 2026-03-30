const Order = require('../models/Order');
const Cart  = require('../models/Cart');

// NEW: notification messages per status
const STATUS_NOTIFICATIONS = {
  'Confirmed':        'Your order has been confirmed! ✅',
  'Preparing':        'Your order is being prepared 🍳',
  'Out for Delivery': 'Your order is out for delivery 🛵',
  'Delivered':        'Your order has been delivered! Enjoy your meal 🎉',
  'Cancelled':        'Your order has been cancelled ❌',
};

// NEW: delivery fee logic — free if item total ≥ ₹150, else ₹20
const calcDeliveryFee = (totalPrice) => (totalPrice >= 150 ? 0 : 20);

// ── Place Order ──────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, customerPhone, customerNote } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    const totalPrice   = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const paymentStatus = paymentMethod === 'UPI' ? 'Payment Pending Verification' : 'Pending';

    // UPDATED: calculate delivery fee dynamically
    const deliveryFee  = calcDeliveryFee(totalPrice);

    const order = await Order.create({
      userId:       req.user._id,
      restaurantId: cart.items[0].restaurantId,
      restaurantName: cart.items[0].restaurantName,
      items: cart.items.map(i => ({
        menuItem: i.menuItem,
        name:     i.name,
        price:    i.price,
        image:    i.image,
        quantity: i.quantity,
        variant:  i.variant || '',
      })),
      totalPrice,
      deliveryFee,           // NEW: stored on order
      deliveryAddress: deliveryAddress || '',
      paymentMethod:   paymentMethod   || 'COD',
      paymentStatus,
      customerPhone:   customerPhone   || '',
      customerNote:    customerNote    || '',
      // NEW: first notification when order is placed
      notifications: [{ message: 'Order placed successfully! We\'ll confirm soon 📋' }],
    });

    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Confirm UPI Payment (with fraud detection) ───────────
const confirmUpiPayment = async (req, res) => {
  try {
    const { orderId, utrNumber, upiPaidAt, iHavePaidAt } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not your order' });

    let isSuspicious   = false;
    let suspiciousReason = '';

    if (!utrNumber || utrNumber.trim() === '') {
      isSuspicious = true;
      suspiciousReason += 'No UTR provided. ';
    }

    if (upiPaidAt && iHavePaidAt) {
      const diff = (new Date(iHavePaidAt) - new Date(upiPaidAt)) / 1000;
      if (diff < 5) {
        isSuspicious = true;
        suspiciousReason += `Paid too fast (${diff.toFixed(1)}s). `;
      }
    }

    if (utrNumber && utrNumber.trim() !== '') {
      const duplicate = await Order.findOne({ _id: { $ne: orderId }, utrNumber: utrNumber.trim() });
      if (duplicate) {
        isSuspicious = true;
        suspiciousReason += 'Duplicate UTR number. ';
      }
    }

    order.utrNumber          = utrNumber?.trim() || '';
    order.paymentStatus      = 'Payment Pending Verification';
    order.isSuspicious       = isSuspicious;
    order.suspiciousReason   = suspiciousReason.trim();
    order.upiPaidClickedAt   = upiPaidAt   ? new Date(upiPaidAt)   : undefined;
    order.iHavePaidClickedAt = iHavePaidAt ? new Date(iHavePaidAt) : undefined;

    // NEW: add notification for UPI submission
    order.notifications.push({ message: 'UPI payment submitted — pending verification 🔍' });

    await order.save();
    res.json({ success: true, data: order, warning: isSuspicious ? suspiciousReason : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Orders ────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Orders (Admin) ───────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.status)        filter.status        = req.query.status;
    if (req.query.suspicious === 'true') filter.isSuspicious = true;

    const orders = await Order.find(filter).populate('userId', 'name email').sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Order / Payment Status (Admin) ─────────────────
// UPDATED: pushes notification when status changes
const updateStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // NEW: push notification only when order STATUS changes (not payment status)
    if (status && status !== order.status) {
      const msg = STATUS_NOTIFICATIONS[status];
      if (msg) order.notifications.push({ message: msg });
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      // NEW: add payment notification
      if (paymentStatus === 'Paid') {
        order.notifications.push({ message: 'Payment approved by restaurant ✅' });
      } else if (paymentStatus === 'Failed') {
        order.notifications.push({ message: 'Payment was rejected. Please contact support ❌' });
      }
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder, confirmUpiPayment, getMyOrders, getAllOrders, updateStatus };
