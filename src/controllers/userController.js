// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const prisma = new PrismaClient();

// // ฟังก์ชันสำหรับการสร้างผู้ใช้
// const createUser = async (email, password, role) => {
//     const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่าน
//     return await prisma.users.create({
//         data: { email, password: hashedPassword, role },
//     });
// };

// // ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้ตามอีเมล
// const getUser = async (email) => {
//     return await prisma.users.findUnique({
//         where: { email },
//     });
// };

// // ฟังก์ชันสำหรับการล็อกอินผู้ใช้
// const loginUser = async (email, password) => {
//     const user = await getUser(email); // ดึงข้อมูลผู้ใช้ตามอีเมล

//     if (!user) {
//         throw new Error('Invalid email or password');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//         throw new Error('Invalid email or password');
//     }

//     // สร้าง JWT token
//     const token = jwt.sign({ email: user.email, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
    
//     return { token, role: user.role };
// };

// // ฟังก์ชันสำหรับการรีเซ็ตรหัสผ่าน
// const resetPassword = async (email, newPassword) => {
//     const hashedPassword = await bcrypt.hash(newPassword, 10); // เข้ารหัสรหัสผ่านใหม่
//     return await prisma.users.update({
//         where: { email },
//         data: { password: hashedPassword },
//     });
// };

// // ฟังก์ชันสำหรับการอัปเดตข้อมูลผู้ใช้
// const updateUser = async (email, data) => {
//     return await prisma.users.update({
//         where: { email },
//         data,
//     });
// };

// // ฟังก์ชันสำหรับการลบผู้ใช้
// const deleteUser = async (email) => {
//     return await prisma.users.delete({
//         where: { email },
//     });
// };

// // ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้ทั้งหมด
// const getAllUsers = async () => {
//     return await prisma.users.findMany();
// };

// module.exports = {
//     createUser,
//     getUser,
//     loginUser,      // เพิ่มฟังก์ชันล็อกอิน
//     resetPassword,   // เพิ่มฟังก์ชันรีเซ็ตรหัสผ่าน
//     updateUser,
//     deleteUser,
//     getAllUsers,
// };


// controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = 'your_jwt_secret';

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้
const register = async (req, res) => {
    const { email, password, street_address, city, state, postal_code, country, phone } = req.body;
    const role = 'user';

    // กำหนดค่า default สำหรับที่อยู่ถ้าข้อมูลไม่ถูกส่งมา
    const defaultAddress = {
        street_address: street_address || '-',
        city: city || '-',
        state: state || '-',
        postal_code: postal_code || '-',
        country: country || '-',
        phone: phone || '-',
    };

    try {
        // แฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้างผู้ใช้ใหม่
        const newUser = await prisma.users.create({
            data: {
                email,
                password: hashedPassword, // ใช้รหัสผ่านที่ถูกแฮช
                role,
            },
        });

        // สร้างที่อยู่ใหม่โดยใช้ข้อมูลที่ได้รับ หรือใช้ค่า default
        const newAddress = await prisma.address.create({
            data: {
                email: newUser.email, // เชื่อมโยงที่อยู่กับผู้ใช้ผ่านอีเมล
                ...defaultAddress,
            },
        });

        // ส่งข้อมูลกลับ
        res.status(201).json({ 
            id: newUser.id, 
            email: newUser.email, 
            role: newUser.role,
            address: newAddress // ส่งที่อยู่ที่สร้างใหม่ด้วย
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันสำหรับการเข้าสู่ระบบ
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            include: {
                address: true, // ใช้ include เพื่อดึงข้อมูลจากตาราง address
            },
        });

        // ทำการ map เพื่อให้ข้อมูลมีรูปแบบตามที่ต้องการ
        const result = users.map(user => {
            // ถ้าไม่มี address ให้ใช้ null
            const address = user.address.length > 0 ? user.address[0] : null;

            return {
                email: user.email,
                role: user.role,
                street_address: address && address.street_address ? address.street_address : "-",
                city: address && address.city ? address.city : "-",
                state: address && address.state ? address.state : "-",
                postal_code: address && address.postal_code ? address.postal_code : "-",
                country: address && address.country ? address.country : "-",
                phone: address && address.phone ? address.phone : "-",
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
const updateUser = async (req, res) => {
    const { email, street_address, city, state, postal_code, country, phone } = req.body;

    try {
        const updatedUser = await prisma.users.update({
            where: { email },
            data: {
                street_address,
                city,
                state,
                postal_code,
                country,
                phone,
            },
        });

        res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันสำหรับลบผู้ใช้
const deleteUser = async (req, res) => {
    const { email } = req.params;

    try {
        // ลบข้อมูลที่เกี่ยวข้องใน address
        await prisma.address.deleteMany({
            where: { email }, // ลบที่อยู่ของผู้ใช้
        });

        // ลบผู้ใช้
        await prisma.users.delete({
            where: { email },
        });

        res.status(200).json({ message: 'User and related address deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน
const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ส่งออกฟังก์ชันทั้งหมด
module.exports = {
    register,
    login,
    getAllUsers,
    updateUser,
    deleteUser,
    resetPassword,
};
