const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 
    },
    filename: (req, file, cb) => {
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); 
    } else {
        cb(new Error('Sirf JPEG, JPG, ya PNG format ki images hi allow hain.'), false); 
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 
    },
    fileFilter: fileFilter
});

const prescriptionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/prescriptions/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prescription-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const prescriptionFileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mmimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Sirf Image (JPG, PNG) ya PDF format hi allow hai.'), false);
    }
};

const uploadPrescription = multer({
    storage: prescriptionStorage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: prescriptionFileFilter
});


module.exports = {
    uploadMedicineImage: upload,
    uploadPrescription: uploadPrescription
};

