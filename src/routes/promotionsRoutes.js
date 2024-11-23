const express = require('express');
const router = express.Router();
const promotionsController = require('../controllers/promotionsController');

// GET all promotions
router.get('/', promotionsController.getPromotions);

// POST a new promotion
router.post('/', promotionsController.createPromotion);

// PUT update a promotion (specify promotion ID)
router.put('/:id', promotionsController.updatePromotion);

// DELETE a promotion by ID
router.delete('/:id', promotionsController.deletePromotion);

module.exports = router;
