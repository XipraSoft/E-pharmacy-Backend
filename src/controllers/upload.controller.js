const db = require('../models');
const Image = db.Image;

exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ message: "At least 1 file is compulsory." });
        }

        const imageIds = [];
        for(const file of req.files){
           const filePath= file.path.replace(/\\/g, '/');
           const newImage=await Image.create({ file_path: filePath });
           imageIds.push(newImage.id);}
           


        
       

    res.send({ message: "Files uploaded successfully!", imageIds: imageIds });
    } catch (error) {  res.status(500).send({ message: error.message }) }
};
