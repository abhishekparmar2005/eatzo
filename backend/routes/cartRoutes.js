const express = require('express');
const router = express.Router();
const { getCart, addItem, updateItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addItem);
router.put('/update', protect, updateItem);
router.delete('/clear', protect, clearCart);

module.exports = router;
