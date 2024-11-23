// const express = require('express');
// const {
//     createUser,
//     getUser,
//     updateUser,
//     deleteUser,
//     getAllUsers,
//     loginUser,
//     resetPassword,
// } = require('../controllers/userController'); // แก้ไขเส้นทางที่นี่

// const router = express.Router();

// // Route สำหรับการสร้างผู้ใช้
// router.post('/', async (req, res) => {
//     const { email, password, role } = req.body;
//     try {
//         const user = await createUser(email, password, role);
//         res.status(201).json(user);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการดึงข้อมูลผู้ใช้ตามอีเมล
// router.get('/:email', async (req, res) => {
//     const { email } = req.params;
//     try {
//         const user = await getUser(email);
//         if (user) {
//             res.status(200).json(user);
//         } else {
//             res.status(404).json({ message: 'User not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการล็อกอิน
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const { token, role } = await loginUser(email, password);
//         res.status(200).json({ token, role });
//     } catch (error) {
//         res.status(401).json({ message: error.message });
//     }
// });

// // Route สำหรับการรีเซ็ตรหัสผ่าน
// router.post('/reset-password', async (req, res) => {
//     const { email, newPassword } = req.body;
//     try {
//         await resetPassword(email, newPassword);
//         res.status(200).json({ message: 'Password reset successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการอัปเดตข้อมูลผู้ใช้
// router.put('/:email', async (req, res) => {
//     const { email } = req.params;
//     const { password, role } = req.body; // ข้อมูลที่ต้องการอัปเดต
//     try {
//         const updatedUser = await updateUser(email, { password, role });
//         res.status(200).json(updatedUser);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการลบผู้ใช้
// router.delete('/:email', async (req, res) => {
//     const { email } = req.params;
//     try {
//         await deleteUser(email);
//         // res.status(204).send(); // ส่งสถานะ 204 No Content
//         res.status(200).json({ message: 'Delete successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Route สำหรับการดึงข้อมูลผู้ใช้ทั้งหมด
// router.get('/', async (req, res) => {
//     try {
//         const users = await getAllUsers();
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;


// routes/userRoutes.js

const express = require('express'); 
const router = express.Router();
const userController = require('../controllers/userController');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware'); 

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/', userController.getAllUsers);

router.put('/',  userController.updateUser); 

router.delete('/:email',  userController.deleteUser); 

router.put('/resetPassword', userController.resetPassword);

module.exports = router;
