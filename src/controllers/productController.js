const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const getAllProduct = async (req, res) => {
    try {
        const products = await prisma.products.findMany({
            orderBy: {
                id: 'desc',
            },
        });

        const productsWithImageUrls = products.map(product => ({
            ...product,
            img: `http://localhost:3000/${product.img}`, 
        }));

        console.log(productsWithImageUrls); 

        res.json(productsWithImageUrls);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const createProduct = async (req, res) => {
    try {
        console.log(req.file); 

        const imgPath = req.file ? `uploads/${req.file.filename}` : ''; 
        const { description, unit, price, size, type, quantity, discount_price, is_on_promotion } = req.body;

        if (!imgPath) {
            return res.status(400).json({ error: 'Image file is required' });
        }
        console.log(imgPath);
        const product = await prisma.products.create({
            data: {
                description,
                unit,
                price: parseFloat(price),
                img: imgPath, 
                size,
                type,
                quantity: parseInt(quantity, 10),
                discount_price: parseFloat(discount_price),
                is_on_promotion: is_on_promotion === 'true',
            },
        });

        res.status(201).json({ message: 'Product created successfully!', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};


const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { description, unit, price, size, type, quantity, discount_price, is_on_promotion } = req.body;

    const imgPath = req.file ? `uploads/${req.file.filename}` : undefined;

    // ตรวจสอบและแปลงค่าของ is_on_promotion ให้ชัดเจน
    const isOnPromotion = is_on_promotion === 'true' || is_on_promotion === true;

    console.log("isOnPromotion:", isOnPromotion);

    try {
        const product = await prisma.products.update({
            where: { id: Number(id) },
            data: {
                description,
                unit,
                price: parseFloat(price), 
                size,
                type,
                quantity: parseInt(quantity, 10),  
                discount_price: parseFloat(discount_price),  
                is_on_promotion: isOnPromotion,  
                img: imgPath || undefined,  
            },
        });

        res.json({ message: 'Product updated successfully!', product });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
};



const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.products.findUnique({
            where: { id: Number(id) },
        });

        if (product && product.img) {
            fs.unlink(product.img, (err) => {
                if (err) console.error('Error deleting image file:', err);
            });
        }

        await prisma.products.delete({
            where: { id: Number(id) },
        });

        res.json({ message: 'Product deleted successfully!' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    const productId = parseInt(id);
    console.log(productId)
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        const product = await prisma.products.findUnique({
            where: {
                id: productId, 
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productWithImageUrl = {
            ...product,
            img: `http://localhost:3000/${product.img}`,  
        };

        res.json(productWithImageUrl);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

const getOnSaleProduct = async (req, res) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                discount_price: {
                    gt: 0, 
                },
                price: {
                    gt: 0,  
                },
                is_on_promotion: true,  
            },
            select: {
                id: true,
                description: true,
                price: true,
                discount_price: true,
                img: true, 
            },
        });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No on-sale products found' });
        }

        const onSaleProductWithImageUrls = products.map(product => ({
            ...product,
            img: `http://localhost:3000/${product.img}`,
        }));

        res.json({
            count: onSaleProductWithImageUrls.length,
            products: onSaleProductWithImageUrls,
        });
    } catch (err) {
        console.error('Error fetching on-sale products:', err);
        return res.status(500).json({ error: 'Failed to fetch on-sale products' });
    }
};


module.exports = {
    getAllProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getOnSaleProduct,
};