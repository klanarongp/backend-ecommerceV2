const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all promotions
const getPromotions = async (req, res) => {
    try {
        const promotions = await prisma.promotion.findMany();
        res.json(promotions);
    } catch (err) {
        console.error('Error fetching promotions:', err);
        res.status(500).json({ message: 'Error fetching promotions' });
    }
};

// POST a new promotion
const createPromotion = async (req, res) => {
    const { id, description, status, discount, start_duedate, end_duedate } = req.body;

    try {
        await prisma.promotion.create({
            data: {
                id,
                description,
                status,
                discount,
                start_duedate: new Date(start_duedate),
                end_duedate: new Date(end_duedate)
            }
        });
        res.status(201).json({ message: 'Promotion created successfully!' });
    } catch (err) {
        console.error('Error creating promotion:', err);
        res.status(500).json({ message: 'Error creating promotion' });
    }
};

// PUT (update) a promotion
const updatePromotion = async (req, res) => {
    const { id, description, status, discount, start_duedate, end_duedate } = req.body;

    try {
        await prisma.promotion.update({
            where: { id },
            data: {
                description,
                status,
                discount,
                start_duedate: new Date(start_duedate),
                end_duedate: new Date(end_duedate)
            }
        });
        res.json({ message: 'Promotion updated successfully!' });
    } catch (err) {
        console.error('Error updating promotion:', err);
        res.status(500).json({ message: 'Error updating promotion' });
    }
};

// DELETE a promotion
const deletePromotion = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.promotion.delete({
            where: { id }
        });
        res.json({ message: 'Promotion deleted successfully!' });
    } catch (err) {
        console.error('Error deleting promotion:', err);
        res.status(500).json({ message: 'Error deleting promotion' });
    }
};

// Export functions
module.exports = {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion
};
