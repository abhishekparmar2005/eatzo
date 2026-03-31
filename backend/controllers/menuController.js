const MenuItem = require('../models/MenuItem');

const getByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

/**
 * Search items by name (case-insensitive, partial match)
 * GET /api/menu/search?q=butter
 * Returns: array of { item, restaurantId, restaurantName }
 */
const searchItems = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ success: true, data: [] });

    const items = await MenuItem.find({
      name: { $regex: q, $options: 'i' },
      isAvailable: true,
    }).populate('restaurantId', 'name image location cuisine rating isOpen openTime closeTime');

    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// FEATURE 3: Edit item — update without deleting
const update = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getByRestaurant, searchItems, create, update, remove };
