import multer from "multer";
import { UploadError } from "./error";

// ✅ Store files in memory (best for cloud upload)
const storage = multer.memoryStorage();

// ✅ File validation
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new UploadError('Unsupported file type'));
  }

  cb(null, true);
};

// ✅ Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
