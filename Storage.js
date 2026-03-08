// upload.js
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("./s3");
require("dotenv").config();

const bucketName = process.env.AWS_BUCKET;

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        key: (req, file, cb) => {
            const uniqueName = Date.now() + "-" + path.basename(file.originalname);
            cb(null, `pfp/${uniqueName}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedExt = /jpeg|jpg|png|gif|heic|heif/;
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/heic",
            "image/heif",
        ];

        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        const mime = file.mimetype.toLowerCase();

        if (allowedExt.test(ext) && allowedMimeTypes.includes(mime)) {
            cb(null, true);
        } else {
            const err = new Error("Only image files are allowed!");
            err.code = "INVALID_FILE_TYPE";
            cb(err);
        }
    },
});

module.exports = upload;
