const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
/**
 * @swagger
 * tags:
 *   name: 3. Medicine Catalog
 *   description: Dawaaiyon ko dekhna aur manage karna.
 */

// --- PUBLIC ROUTES ---
/**
 * @swagger
 * /api/medicines:
 *   get:
 *     summary: Saari medicines hasil karna (search, filter, sort, pagination ke saath)
 *     tags: [3. Medicine Catalog]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Medicine ka naam search karein
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category se filter karein
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, name_asc, name_desc] }
 *         description: Tarteeb dein
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Har page par items ki tadad
 *     responses:
 *       200:
 *         description: Medicines ki list.
 */
router.get('/', medicineController.getAllMedicines);

/**
 * @swagger
 * /api/medicines/search/suggestions:
 *   get:
 *     summary: Search ke liye auto-suggestions hasil karna
 *     tags: [3. Medicine Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search text (kam se kam 2 huroof)
 *     responses:
 *       200:
 *         description: Suggestions ka array.
 */
router.get('/search/suggestions', medicineController.getSearchSuggestions);

/**
 * @swagger
 * /api/medicines/{id}:
 *   get:
 *     summary: Ek specific medicine ki details hasil karna
 *     tags: [3. Medicine Catalog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Medicine ki ID
 *     responses:
 *       200:
 *         description: Medicine ki details.
 *       404:
 *         description: Medicine nahi mili.
 */
router.get('/:id', medicineController.getMedicineById);


// --- ADMIN ONLY ROUTES ---
/**
 * @swagger
 * /api/medicines:
 *   post:
 *     summary: Nayi medicine add karna (Admin Only)
 *     tags: [4. Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               inventory_quantity: { type: integer }
 *               category: { type: string }
 *               medicineImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Medicine kamyabi se add ho gayi.
 */

/**
 * @swagger
 * /api/medicines/{id}:
 *   patch:
 *     summary: Ek medicine ko update karna (Admin Only)
 *     tags: [4. Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Medicine ki ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price: { type: number }
 *               inventory_quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Medicine kamyabi se update ho gayi.
 */
router.patch('/:id', [verifyToken, isAdmin], medicineController.updateMedicine);

/**
 * @swagger
 * /api/medicines/{id}:
 *   delete:
 *     summary: Ek medicine ko delete karna (Admin Only)
 *     tags: [4. Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Medicine ki ID
 *     responses:
 *       200:
 *         description: Medicine kamyabi se delete ho gayi.
 */
router.delete('/:id', [verifyToken, isAdmin], medicineController.deleteMedicine);

module.exports = router;