const db = require('../models');
const Wishlist = db.Wishlist;
const WishlistItem = db.WishlistItem;
const Medicine = db.Medicine;

// Helper function: User ki wishlist hasil karna ya nayi banana
const getOrCreateWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ where: { user_id: userId } });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user_id: userId });
    }
    return wishlist;
};


// 1. Wishlist mein Item Add Karna
exports.addItemToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { medicineId } = req.body;

        if (!medicineId) {
            return res.status(400).send({ message: "Medicine ID is compulsory." });
        }

        const wishlist = await getOrCreateWishlist(userId);
        const medicine = await Medicine.findByPk(medicineId);

        if (!medicine) {
            return res.status(404).send({ message: "Medicine not found." });
        }

        // Check karein ke item pehle se wishlist mein hai ya nahi
        const [wishlistItem, created] = await WishlistItem.findOrCreate({
            where: { wishlist_id: wishlist.id, medicine_id: medicineId }
        });

        if (!created) {
            return res.status(409).send({ message: "Item is already present in your wish list." });
        }
        
        res.status(201).send({ message: "Item is added to wishlist suucesfully.", wishlistItem });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 2. User ki Wishlist Dekhna
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({
            where: { user_id: userId },
            include: [{
                model: WishlistItem,
                as: 'WishlistItems',
                include: [{
                    model: Medicine, 
                    as : 'Medicine',
                    include: [{
                        model: db.Image,
                        as: 'images',
                        attributes: ['file_path']
                    }]
                    
                }]
            }]
        });

        if (!wishlist) {
            return res.status(200).send({ message: "Your wishlist is empty.", items: [] });
        }
        res.status(200).send(wishlist);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 3. Wishlist se Item Remove Karna
exports.removeItemFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const medicineIdToRemove = req.params.medicineId; // Yeh Medicine ki ID hai

        const wishlist = await Wishlist.findOne({ where: { user_id: userId } });
        if (!wishlist) {
            return res.status(404).send({ message: "Wishlist not found." });
        }

        const deleted = await WishlistItem.destroy({
            where: { 
                wishlist_id: wishlist.id,
                medicine_id: medicineIdToRemove
            }
        });

        if (deleted) {
            res.status(200).send({ message: "Item added to wishlist successfully" });
        } else {
            res.status(404).send({ message: "This item is not present in your wishlist" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};