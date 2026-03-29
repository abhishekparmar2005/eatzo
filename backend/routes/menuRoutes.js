const express = require('express');
const router = express.Router();
const { getByRestaurant, create, update, remove } = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/restaurant/:restaurantId', getByRestaurant);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
