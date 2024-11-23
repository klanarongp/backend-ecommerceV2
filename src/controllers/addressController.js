const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับการดึงข้อมูล address ทั้งหมด
const getAllAddresses = async (req, res) => {
    try {
        const addresses = await prisma.address.findMany();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงที่อยู่', error: error.message });
    }
};

// ฟังก์ชันสำหรับการสร้าง address ใหม่
const createAddress = [
    body('email').isEmail().withMessage('Email is required and must be valid'),
    body('street_address').notEmpty().withMessage('Street address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postal_code').notEmpty().withMessage('Postal code is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, street_address, city, state, postal_code, country, phone } = req.body;

        try {
            const newAddress = await prisma.address.create({
                data: { email, street_address, city, state, postal_code, country, phone },
            });
            res.status(201).json({ message: 'ที่อยู่ถูกสร้างเรียบร้อยแล้ว!', id: newAddress.id });
        } catch (error) {
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างที่อยู่', error: error.message });
        }
    }
];

// ฟังก์ชันสำหรับการลบ address โดยใช้อีเมล
const deleteAddress = async (req, res) => {
    const { email } = req.params;
    try {
        const deletedAddress = await prisma.address.delete({
            where: { email },
        });
        res.status(200).json({ message: 'ที่อยู่ถูกลบเรียบร้อยแล้ว!' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบที่อยู่', error: error.message });
    }
};

// ฟังก์ชันสำหรับการอัปเดต address โดยใช้อีเมล
const updateAddress = async (req, res) => {
    const { email } = req.params;
    const { street_address, city, state, postal_code, country, phone } = req.body;

    try {
        const updatedAddress = await prisma.address.update({
            where: { email },
            data: { street_address, city, state, postal_code, country, phone },
        });
        res.status(200).json({ message: 'Address updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating address', error: error.message });
    }
    console.log(req.user.email)
};

// ฟังก์ชันสำหรับการอัปเดต address โดยใช้อีเมลที่ระบุใน params
const updateAddressUser = async (req, res) => {
    console.log(req.user.email)
    const email = req.user.email;
    const { street_address, city, state, postal_code, country, phone } = req.body;

    try {
        const updatedAddress = await prisma.address.update({
            where: { email },
            data: { street_address, city, state, postal_code, country, phone },
        });

        res.status(200).json({ message: 'Address updated successfully!', address: updatedAddress });
    } catch (error) {
        console.error('Error updating address:', error);
        if (error.code === 'P2025') { // Prisma error for 'Record to update not found'
            return res.status(404).json({ message: 'Address not found for the given email.' });
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    getAllAddresses,
    createAddress,
    deleteAddress,
    updateAddress,
    updateAddressUser,
};

