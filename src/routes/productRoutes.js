// const express = require('express'); 
// const router = express.Router();
// const productController = require('../controllers/productController');
// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//     }
// });
// const upload = multer({ storage });


// router.get('/onsale', productController.getOnSaleProduct);


// router.get('/', productController.getAllProduct);


// router.get('/:id', productController.getProductById);


// router.post('/', upload.single('img'), productController.createProduct);


// router.put('/:id', upload.single('img'), productController.updateProduct);

// router.delete('/:id', productController.deleteProduct);




// module.exports = router;


const express = require('express');
const multer = require('multer');
const productController = require('../controllers/productController');
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

router.get('/onsale', productController.getOnSaleProduct);

// เส้นทางที่ใช้ในการดึงข้อมูลผลิตภัณฑ์ทั้งหมด
router.get('/', productController.getAllProduct);

// เส้นทางที่ใช้ในการดึงข้อมูลผลิตภัณฑ์โดย ID
router.get('/:id', productController.getProductById);

// เส้นทางที่ใช้ในการสร้างผลิตภัณฑ์ใหม่
router.post('/', upload.single('img'), productController.createProduct);  // ส่งไฟล์ img

// เส้นทางที่ใช้ในการอัปเดตผลิตภัณฑ์
router.put('/:id', upload.single('img'), productController.updateProduct);

// เส้นทางที่ใช้ในการลบผลิตภัณฑ์
router.delete('/:id', productController.deleteProduct);

// เส้นทางที่ใช้ในการดึงผลิตภัณฑ์ที่กำลังลดราคา
// router.get('/on-sale', productController.getOnSaleProduct);

module.exports = router;
