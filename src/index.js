const express = require('express');
const { PrismaClient } = require('@prisma/client');
const userRoutes = require('./routes/userRoutes'); // ปรับเส้นทางที่นี่
const addressRoutes = require('./routes/addressRoutes'); // นำเข้า address routes
const productRoutes = require('./routes/productRoutes');
const billingRoutes = require('./routes/billingRoutes');
const billingListRoutes = require('./routes/billingListRoutes');
const promotionsRoutes = require('./routes/promotionsRoutes');
const path = require('path');


const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000; // ตั้งค่าพอร์ต
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:4000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
}));

// Middleware
app.use(express.json()); // ใช้ JSON middleware เพื่อแปลง JSON body เป็น object 

app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// ใช้เส้นทางสำหรับผู้ใช้
app.use('/users', userRoutes);

app.use('/addresses', addressRoutes);
app.use('/product', productRoutes);
app.use('/billing', billingRoutes);
app.use('/billingList', billingListRoutes);
app.use('/promotions', promotionsRoutes);


// เส้นทางหลัก (สามารถเพิ่มเติมได้)
app.get('/', (req, res) => {
    res.send('Welcome to the eCommerce API');
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
