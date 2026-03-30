const express = require('express');
const router = express.Router();
const { placeOrder, confirmUpiPayment, getMyOrders, getAllOrders, updateStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.post('/confirm-upi', protect, confirmUpiPayment);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
