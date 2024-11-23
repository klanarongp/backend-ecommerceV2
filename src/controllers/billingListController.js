const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// ฟังก์ชัน getAllBillingLists
const getAllBillingList = async (req, res) => {
    try {
        console.log(prisma.billingDetail);
        console.log(prisma.billing_detail);
        const billingLists = await prisma.billing_detail.findMany({
            include: {
                billing: { // Join กับ billing table
                    select: {
                        status: true,
                    }
                }
            }
        });
        res.status(200).json(billingLists);
    } catch (err) {
        console.error('Error fetching billing lists:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล billing list', error: err });
    }
};

// const getAllBillingList = async (req, res) => {
//     try {
//         const billingLists = await prisma.billing_detail.findMany({
//             select: {
//                 product_id: true,
//                 order_id: true,
//                 unit: true,
//                 price: true,
//                 total_price: true,
//                 quantity: true,
//                 billing: {
//                     select: {
//                         status: true,
//                     }
//                 }
//             }
//         });
//         res.status(200).json(billingLists);
//     } catch (err) {
//         console.error('Error fetching billing lists:', err);
//         res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล billing list', error: err });
//     }
// };

// ฟังก์ชัน createBillingList
const createBillingList = async (req, res) => {
    const { product_id, order_id, unit, price, total_price, quantity } = req.body;
    console.log(req.body);

    if (!product_id || !order_id || !unit || !price || !total_price || !quantity) {
        return res.status(400).json({ message: 'กรุณาระบุข้อมูลให้ครบถ้วน' });
    }

    // แปลงค่าของ total_price ให้เป็น Float
    const totalPriceFloat = parseFloat(total_price);

    try {
        const billingList = await prisma.billing_detail.create({
            data: {
                product_id,
                order_id,
                unit,
                price,
                total_price: totalPriceFloat, // ใช้ค่าแปลงแล้ว
                quantity
            }
        });

        res.status(201).json({ message: 'สร้าง billing list สำเร็จ!', id: billingList.order_id });
    } catch (err) {
        console.error('Error creating billing list:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้าง billing list', error: err });
    }
};


// ฟังก์ชัน deleteBillingList
const deleteBillingList = async (req, res) => {
    const { order_id, product_id } = req.params;
    
    try {
        const deleteBillingList = await prisma.billing_detail.delete({
            where: {
                order_id_product_id: {
                    order_id: Number(order_id),
                    product_id: Number(product_id)
                }
            }
        });
        console.log(deleteBillingList); // ตรวจสอบค่าที่ได้จาก Prisma
        res.status(200).json({ message: 'ลบ billing list สำเร็จ!' });
    } catch (err) {
        console.error('Error deleting billing list:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบ billing list', error: err });
    }
};

// ส่งออกฟังก์ชัน
module.exports = {
    getAllBillingList,
    createBillingList,
    deleteBillingList
};
