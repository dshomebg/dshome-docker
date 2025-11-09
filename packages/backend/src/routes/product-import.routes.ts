import { Router } from 'express';
import multer from 'multer';
import {
  parseExcelForMapping,
  processProductImport,
  validateProductImport
} from '../controllers/product-import.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xls, .xlsx) are allowed.'));
    }
  }
});

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

// Parse Excel file and return columns for mapping
router.post('/parse', upload.single('file'), parseExcelForMapping);

// Validate import data
router.post('/validate', upload.single('file'), validateProductImport);

// Process import
router.post('/process', upload.single('file'), processProductImport);

export default router;
