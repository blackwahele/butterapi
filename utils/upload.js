import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path'; 
import express from 'express';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();


app.use('/importExcelData', express.static(join(__dirname, 'importExcelData')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use('/uploads/shape', express.static(join(__dirname, 'uploads')));


const UploadFileAndImages = async function(req, res, next) {
    try {      
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const fileType = file.mimetype.split('/')[0];
                let uploadPath = '';
                if (fileType == 'image') {
                    uploadPath = "uploads/images";
                } else if (fileType == 'application' || fileType === "text") {
                    uploadPath = "uploads/importExcelData";
                } else if(fileType == 'video'){
                    uploadPath = "uploads/video"
                } else {
                    return next(new Error('Unsupported file type'));
                }
                cb(null, join(__dirname, '..', uploadPath));
            },
            filename: (req, file, cb) => {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
                const originalName = file.originalname;
                const ext = extname(originalName);
                const newFilename = `${timestamp}${ext}`;
                cb(null, newFilename);
            }
        });
    
        const upload = multer({ storage: storage });
        upload.any()(req, res, function(err) {
            if (err) { 
                return next(err);
            }        
            next();
        });
    } catch (error) {       
        console.log(error);
    }
};

export default UploadFileAndImages;