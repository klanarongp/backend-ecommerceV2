const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const prisma = new PrismaClient();


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

// ฟังก์ชันจัดการข้อผิดพลาด
const handleError = (res, error) => {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
};

// ฟังก์ชันตรวจสอบข้อมูล billing
const validateBillingData = (data) => {
    const errors = [];
    if (!data.promotion_id) errors.push('Promotion ID is required');
    if (data.amount <= 0) errors.push('Amount must be greater than 0');
    if (data.price < 0) errors.push('Price cannot be negative');
    if (data.total_price < 0) errors.push('Total price cannot be negative');
    return errors.length > 0 ? errors : null;
};

// ฟังก์ชันอัปโหลดภาพ Billing
const uploadBillingImage = upload.single('billingImage');

// ดึงข้อมูล Billing ทั้งหมดสำหรับผู้ดูแลระบบ
const getAllBillingRecordsAdmin = async (req, res) => {
    try {
        const billingRecords = await prisma.billing.findMany({
            include: {
                billing_detail: true,
            },
            orderBy: { order_id: 'desc' }
        });

        const formattedResults = billingRecords.map(billing => ({
            ...billing,
            img_bill: billing.img_bill ? `http://localhost:3000/${billing.img_bill}` : null,
            orderDetail: billing.billing_detail.map(detail => ({
                ...detail,
                product_img: detail.product ? `http://localhost:3000/${detail.product.img}` : null,
                product_description: detail.product?.description,
            })),
        }));

        res.status(200).json({
            message: 'Billing records retrieved successfully',
            dataBilling: formattedResults,
        });
    } catch (error) {
        handleError(res, error);
    }
};

// ดึงข้อมูล Billing ทั้งหมดสำหรับผู้ใช้งานตาม email
const getAllBillingRecordsUser = async (req, res) => {
    const { email } = req.user;
    try {
        const billingRecords = await prisma.billing.findMany({
            where: { email },
            include: {
                billing_detail: {
                    include: {
                        products: true,
                    },
                },
            },
            orderBy: { order_id: 'desc' }
        });

        // จัดกลุ่มข้อมูลให้เหมือนโครงสร้างของโค้ดเก่า
        let result = [];
        let arrTemp = { orderId: '', count: -1 };

        billingRecords.forEach(billing => {
            billing.billing_detail.forEach(detail => {
                if (arrTemp.orderId === '' || arrTemp.orderId !== billing.order_id) {
                    result.push({
                        order_id: billing.order_id,
                        email: billing.email,
                        promotion_id: billing.promotion_id,
                        amount: billing.amount,
                        price: billing.price,
                        total_price: billing.total_price,
                        status: billing.status,
                        img_bill: billing.img_bill ? `http://localhost:3000/${billing.img_bill}` : null,
                        orderDetail: [{
                            order_id: detail.order_id,
                            product_id: detail.product_id,
                            unit: detail.unit,
                            price: detail.price,
                            totalPrice: detail.total_price,
                            quantity: detail.quantity,
                            product_img: detail.products ? `http://localhost:3000/${detail.products.img}` : null,
                            product_description: detail.products ? detail.products.description : 'No description available',
                        }]
                    });
                    arrTemp.count++;
                } else {
                    result[arrTemp.count].orderDetail.push({
                        order_id: detail.order_id,
                        product_id: detail.product_id,
                        unit: detail.unit,
                        price: detail.price,
                        totalPrice: detail.total_price,
                        quantity: detail.quantity,
                        product_img: detail.products ? `http://localhost:3000/${detail.products.img}` : null,
                        product_description: detail.products ? detail.products.description : 'No description available',
                    });
                }
                arrTemp.orderId = billing.order_id;
            });
        });

        res.status(200).json({
            message: 'Billing records retrieved successfully',
            dataBilling: result,
        });

    } catch (error) {
        handleError(res, error);
    }
};


// สร้าง Billing record ใหม่
const createBillingRecord = async (req, res) => {
    const { email } = req.user;
    const { promotion_id, amount, vat, price, total_price } = req.body;
    const imgPath = req.file ? `uploads/${req.file.filename}` : ''; 
    const status = 'pending';  // กำหนดค่าให้กับ status, เช่น 'pending', 'paid', 'unpaid', หรืออื่นๆ ตามที่ต้องการ

    // แปลงค่าจาก String เป็น Int หรือ Float ตามต้องการ
    const amountInt = parseInt(amount, 10);  // แปลง amount เป็น Integer
    const vatFloat = parseFloat(vat);        // แปลง vat เป็น Float
    const priceInt = parseInt(price, 10);    // แปลง price เป็น Integer
    const totalPriceFloat = parseFloat(total_price); // แปลง total_price เป็น Float

    const validationError = validateBillingData(req.body);
    if (validationError) {
        return res.status(400).json({ message: 'Invalid input', errors: validationError });
    }

    try {
        const billingRecord = await prisma.billing.create({
            data: {
                email,
                promotion_id,
                amount: amountInt,    // ใช้ค่าที่แปลงแล้ว
                vat: vatFloat,        // ใช้ค่าที่แปลงแล้ว
                price: priceInt,      // ใช้ค่าที่แปลงแล้ว
                total_price: totalPriceFloat, // ใช้ค่าที่แปลงแล้ว
                img_bill: imgPath,
                status: status, // ส่งค่าให้กับ status
            },
        });

        res.status(201).json({
            message: 'Billing record created successfully!',
            data: {
                ...billingRecord,
                img_bill: imgPath ? `http://localhost:3000/${imgPath}` : null
            }
        });
    } catch (error) {
        handleError(res, error);
    }
};

// const createBillingRecord = async (req, res) => {
//     const { email } = req.user;
//     const { promotion_id, amount, vat, price, total_price } = req.body;
//     const imgPath = req.file ? req.file.path : null;

//     // Validate billing data
//     const validationError = validateBillingData(req.body);
//     if (validationError) {
//         return res.status(400).json({ message: 'Invalid input', errors: validationError });
//     }

//     try {
//         // สร้าง billing record โดยไม่ส่ง status ไป
//         const billingRecord = await prisma.billing.create({
//             data: {
//                 email,
//                 promotion_id,
//                 amount: parseInt(amount, 10),  // ตรวจสอบว่า amount เป็นจำนวนเต็ม
//                 vat: parseFloat(vat),  // ตรวจสอบว่า vat เป็นจำนวนทศนิยม
//                 price: parseFloat(price),
//                 total_price: parseFloat(total_price),
//                 img_bill: imgPath,
//                 status: null,  // status เริ่มต้นเป็น null
//             },
//         });

//         res.status(201).json({
//             message: 'Billing record created successfully!',
//             data: {
//                 order_id: billingRecord.id,
//                 email,
//                 promotion_id,
//                 amount: parseInt(amount, 10),
//                 vat: parseFloat(vat),
//                 price: parseFloat(price),
//                 total_price: parseFloat(total_price),
//                 img_bill: imgPath ? `http://localhost:3000/${imgPath}` : null,
//                 status: null  // status เริ่มต้นเป็น null
//             }
//         });
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// อัปเดตสถานะของ Billing
const updateBillingStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    try {
        const updatedBilling = await prisma.billing.update({
            where: { order_id: Number(order_id) },
            data: { status },
        });

        res.status(200).json({ message: 'Billing status updated successfully!' });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Billing record not found' });
        } else {
            handleError(res, error);
        }
    }
};

// ลบ Billing record ด้วย order_id
const deleteBillingRecord = async (req, res) => {
    const { order_id } = req.params;

    try {
        const deletedBilling = await prisma.billing.delete({
            where: { order_id: Number(order_id) },
        });

        if (deletedBilling.img_bill) {
            fs.unlink(deletedBilling.img_bill, (err) => {
                if (err) console.error('Error deleting image file:', err);
            });
        }

        res.status(200).json({ message: `Billing record with order_id ${order_id} deleted successfully!` });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Billing record not found' });
        } else {
            handleError(res, error);
        }
    }
};

// export functions as const
module.exports = {
    uploadBillingImage,
    getAllBillingRecordsAdmin,
    getAllBillingRecordsUser,
    createBillingRecord,
    updateBillingStatus,
    deleteBillingRecord
};
