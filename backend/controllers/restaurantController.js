const Restaurant = require('../models/Restaurant');

const getAll = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort('-createdAt');
    res.json({ success: true, data: restaurants });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
  try {
    const r = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const update = async (req, res) => {
  try {
    const r = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, getOne, create, update, remove };
