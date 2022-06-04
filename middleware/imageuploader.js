const multer = require('multer');
const path = require('path');
const fs = require('fs');

const rootDir = path.dirname(require.main.filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dirPath = path.join(rootDir, 'public', 'uploads', 'user'); // uploads directory i.e public/uploads/user
        req.body.filePath = dirPath; // storing file path in request body
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {
                recursive: true
            });
        }
        cb(null, dirPath);
    },
    filename: function (req, file, cb) {
        const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        req.body.userImage = filename;
        cb(null, filename);
    }
})

// student list csv file upload
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("wrong format"));
        }
    },
    limits: {
        fileSize: 8 * (1024 * 1024) // 8mb
    }
}).single('userImage');

// upload middleware
const uploadMiddleware = async (req, res, next) => {
    try {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).send({
                    message: err.message,
                    status: 400
                });
            } else if (err) {
                // An unknown error occurred when uploading.
                if (err.message === 'wrong format') {
                    return res.status(400).send({
                        message: 'Invalid image format',
                        status: 400
                    });
                } else {
                    return res.status(500).send({
                        message: err.message,
                        status: 500
                    });
                }
            }
            next();
        });
    } catch (error) {
        console.log('\x1b[36m%s\x1b[0m', 'Error had occured at uploadMiddleware for userImage upload:', error);
        return res.status(500).send({
            message: error.message,
            status: 500
        });
    }
};


module.exports  = uploadMiddleware;