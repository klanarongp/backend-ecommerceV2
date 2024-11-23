// const express = require('express');
// const {
//     getAllAddresses,
//     createAddress,
//     deleteAddress,
//     updateAddress,
//     updateAddressUser,
// } = require('../controllers/addressController');

// const router = express.Router();

// // Route สำหรับการดึงข้อมูล address ทั้งหมด
// router.get('/', async (req, res) => {
//     console.log(res);
//     try {
//         await getAllAddresses(req, res);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการสร้าง address ใหม่
// router.post('/', async (req, res) => {
//     try {
//         await createAddress(req, res);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการลบ address โดยใช้ email
// router.delete('/:email', async (req, res) => {
//     try {
//         await deleteAddress(req, res);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการอัปเดต address โดยใช้ email จาก user ที่เข้าสู่ระบบ
// router.put('/', async (req, res) => {
//     try {
//         await updateAddress(req, res);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการอัปเดต address โดยใช้ email ที่ระบุใน params
// router.put('/:email', async (req, res) => {
//     try {
//         await updateAddressUser(req, res);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');


router.put('/update_address', authenticateToken,addressController.updateAddressUser);

router.put('/:email',addressController.updateAddress);
// GET all addresses
router.get('/',  addressController.getAllAddresses);

// POST a new address
router.post('/', addressController.createAddress);

// DELETE an address by email
router.delete('/:email',  addressController.deleteAddress);



module.exports = router;
