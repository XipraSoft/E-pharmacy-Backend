const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 
    },
    filename: (req, file, cb) => {
        
        const uniqueSuffix = Date.now() ;
        cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); 
    } else {
        cb(new Error('only Image (JPG, PNG) or JPEG format is allowed .'), false); 
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
        const unique = Date.now() ;
        cb(null, 'prescription-' + req.user.id + '-' + unique + path.extname(file.originalname));
    }
});

const prescriptionFileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mmimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('only Image (JPG, PNG) or PDF format is allowed .'), false);
    }
};

const uploadPrescription = multer({
    storage: prescriptionStorage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: prescriptionFileFilter
});

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/'); 
    },
    filename: (req, file, cb) => {
        const unique = Date.now();
        cb(null, 'avatar-' + req.user.id + '-' + unique + path.extname(file.originalname));
    }
});

const uploadProfileImage = multer({
    storage: profileStorage,
    limits: { fileSize: 1024 * 1024 * 2 },
    fileFilter: fileFilter  
});

module.exports = {
    uploadMedicineImage: upload,
    uploadPrescription: uploadPrescription,
       uploadProfileImage: uploadProfileImage
};

