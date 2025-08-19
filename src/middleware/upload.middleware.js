const multer = require('multer');
const path = require('path');

// 1. Storage Engine (Kahan aur kis naam se file save karni hai)
const storage = multer.diskStorage({
    // Destination: Kahan save karna hai
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 'uploads/' folder mein save karna hai
    },
    // Filename: Kya naam dena hai
    filename: (req, file, cb) => {
        // Hum file ka naam unique banayenge taake koi file overwrite na ho
        // Naya naam = fieldname-timestamp.extension
        // e.g., medicineImage-1678886400000.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. File Filter (Sirf images ko allow karna)
const fileFilter = (req, file, cb) => {
    // Sirf jpeg, jpg, aur png files ko allow karna
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); // Sahi file hai, aage jane do
    } else {
        cb(new Error('Sirf JPEG, JPG, ya PNG format ki images hi allow hain.'), false); // Ghalt file hai, rok do
    }
};

// 3. Multer ko Configure karna
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB file size limit
    },
    fileFilter: fileFilter
});

const prescriptionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/prescriptions/'); // Alag folder mein save karna
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prescription-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const prescriptionFileFilter = (req, file, cb) => {
    // Sirf jpeg, jpg, png, aur pdf files ko allow karna
    if (file.mimetype === 'image/jpeg' || file.mmimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Sirf Image (JPG, PNG) ya PDF format hi allow hai.'), false);
    }
};

const uploadPrescription = multer({
    storage: prescriptionStorage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10 MB file size limit
    },
    fileFilter: prescriptionFileFilter
});


// Dono ko export karein
module.exports = {
    uploadMedicineImage: upload,
    uploadPrescription: uploadPrescription
};

