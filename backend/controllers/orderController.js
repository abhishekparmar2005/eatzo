const Order = require('../models/Order');
const Cart = require('../models/Cart');

const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    const totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({
      userId: req.user._id,
      restaurantId: cart.items[0].restaurantId,
      restaurantName: cart.items[0].restaurantName,
      items: cart.items.map(i => ({ menuItem: i.menuItem, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
      totalPrice,
      deliveryAddress: deliveryAddress || req.user.address,
      paymentMethod: paymentMethod || 'COD',
    });

    // Clear cart after order
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.status(201).json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateStatus };
