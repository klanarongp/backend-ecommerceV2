const express = require('express');
const router = express.Router();
const billingListController = require('../controllers/billingListController');

// GET ข้อมูล billing
router.get('/', billingListController.getAllBillingList);

// POST สร้าง 
router.post('/', billingListController.createBillingList);

// DELETE
router.delete('/:order_id/:product_id', billingListController.deleteBillingList);

module.exports = router; 
