const db = require('../models');
const Page = db.Page;

// ==========================================================
// ADMIN FUNCTIONS
// ==========================================================
// 1. Naya Page Banana ya Purane ko Update Karna (Upsert)
exports.createOrUpdatePage = async (req, res) => {
    try {
        const { title, slug, content } = req.body;
        if (!title || !slug || !content) {
            return res.status(400).send({ message: "Title, slug, aur content zaroori hain." });
        }
        
        // findOrCreate ka istemal karke hum "upsert" kar rahe hain
        const [page, created] = await Page.findOrCreate({
            where: { slug: slug },
            defaults: { title: title, content: content }
        });

        if (!created) {
            // Agar pehle se tha, to usay update kar do
            page.title = title;
            page.content = content;
            await page.save();
        }

        res.status(200).send({ message: `Page '${slug}' kamyabi se save ho gaya.`, page });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


// ==========================================================
// PUBLIC FUNCTIONS
// ==========================================================
// 2. Public: Ek Page ko uske Slug se Hasil Karna
exports.getPageBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const page = await Page.findOne({
            where: { slug: slug },
            attributes: ['title', 'content', 'updatedAt'] // Sirf zaroori data bhejein
        });

        if (!page) {
            return res.status(404).send({ message: "Page nahi mila." });
        }
        res.status(200).send(page);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 3. Public: Saare available pages ki list (Sirf title aur slug)
exports.getAllPages = async (req, res) => {
    try {
        const pages = await Page.findAll({
            attributes: ['title', 'slug']
        });
        res.status(200).send(pages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};