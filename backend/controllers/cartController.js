const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = { items: [] };
    res.json({ success: true, data: cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const addItem = async (req, res) => {
  try {
    const { menuItemId, quantity = 1, variant = '', variantPrice } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ success: false, message: 'Item not found' });

    const restaurant = await Restaurant.findById(menuItem.restaurantId);

    // Use variant price if provided, else base price
    const price = variantPrice ? Number(variantPrice) : menuItem.price;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, items: [] });

    // Clear cart if adding from a different restaurant
    if (
      cart.items.length > 0 &&
      cart.items[0].restaurantId?.toString() !== menuItem.restaurantId.toString()
    ) {
      cart.items = [];
    }

    // Match by menuItem ID AND variant name (so Half and Full are separate rows)
    const existingIdx = cart.items.findIndex(
      i => i.menuItem.toString() === menuItemId && (i.variant || '') === variant,
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price,
        image: menuItem.image,
        quantity,
        variant,
        restaurantId: menuItem.restaurantId,
        restaurantName: restaurant?.name || '',
      });
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// FIXED: match by menuItemId + variant so Half/Full rows update independently
const updateItem = async (req, res) => {
  try {
    const { menuItemId, quantity, variant = '' } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    // Match on both menuItemId AND variant
    const idx = cart.items.findIndex(
      i => i.menuItem.toString() === menuItemId && (i.variant || '') === variant,
    );

    if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getCart, addItem, updateItem, clearCart };
