const express = require('express');
const multer = require('multer');
const billingController = require('../controllers/billingController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const path = require('path');
const router = express.Router();

// การกำหนดการอัปโหลดไฟล์ด้วย multer (สำหรับการอัปโหลดรูปภาพของสินค้า)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // เก็บไฟล์ในโฟลเดอร์ public/uploads
        cb(null, path.join(__dirname, '..', '..', 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่โดยใช้ timestamp
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// GET 
router.get('/',  billingController.getAllBillingRecordsAdmin);

router.get('/bill_user', authenticateToken,billingController.getAllBillingRecordsUser);

// POST 
router.post('/',  upload.single('img_bill'),authenticateToken,billingController.createBillingRecord);

// PUT (เพิ่ม endpoint นี้)
router.put('/:order_id', billingController.updateBillingStatus);


// DELETE 
router.delete('/:order_id', billingController.deleteBillingRecord);

module.exports = router;