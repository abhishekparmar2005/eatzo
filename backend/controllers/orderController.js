const Order = require('../models/Order');
const Cart = require('../models/Cart');

// ── Place Order ──────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, customerPhone, customerNote } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    const totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const paymentStatus = paymentMethod === 'UPI' ? 'Payment Pending Verification' : 'Pending';

    const order = await Order.create({
      userId: req.user._id,
      restaurantId: cart.items[0].restaurantId,
      restaurantName: cart.items[0].restaurantName,
      items: cart.items.map(i => ({
        menuItem: i.menuItem,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
        variant: i.variant || '',
      })),
      totalPrice,
      deliveryAddress: deliveryAddress || '',
      paymentMethod: paymentMethod || 'COD',
      paymentStatus,
      customerPhone: customerPhone || '',
      customerNote: customerNote || '',
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

    // ── Fraud Detection ──────────────────────────────────
    let isSuspicious = false;
    let suspiciousReason = '';

    // 1. No UTR provided
    if (!utrNumber || utrNumber.trim() === '') {
      isSuspicious = true;
      suspiciousReason += 'No UTR provided. ';
    }

    // 2. Clicked "I've Paid" less than 5 seconds after "Pay Now"
    if (upiPaidAt && iHavePaidAt) {
      const diff = (new Date(iHavePaidAt) - new Date(upiPaidAt)) / 1000;
      if (diff < 5) {
        isSuspicious = true;
        suspiciousReason += `Paid too fast (${diff.toFixed(1)}s). `;
      }
    }

    // 3. Duplicate UTR — check if same UTR used before
    if (utrNumber && utrNumber.trim() !== '') {
      const duplicate = await Order.findOne({
        _id: { $ne: orderId },
        utrNumber: utrNumber.trim(),
      });
      if (duplicate) {
        isSuspicious = true;
        suspiciousReason += 'Duplicate UTR number. ';
      }
    }

    order.utrNumber = utrNumber?.trim() || '';
    order.paymentStatus = 'Payment Pending Verification';
    order.isSuspicious = isSuspicious;
    order.suspiciousReason = suspiciousReason.trim();
    order.upiPaidClickedAt = upiPaidAt ? new Date(upiPaidAt) : undefined;
    order.iHavePaidClickedAt = iHavePaidAt ? new Date(iHavePaidAt) : undefined;

    await order.save();

    res.json({
      success: true,
      data: order,
      warning: isSuspicious ? suspiciousReason : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Orders ────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Get All Orders (Admin) ───────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.suspicious === 'true') filter.isSuspicious = true;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Update Order / Payment Status (Admin) ────────────────
const updateStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { placeOrder, confirmUpiPayment, getMyOrders, getAllOrders, updateStatus };
