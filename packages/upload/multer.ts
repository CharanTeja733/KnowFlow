import multer from "multer";
import { UploadError } from "./error";
import { uploadConfig } from "@repo/config";

// ✅ Store files in memory (best for cloud upload)
const storage = multer.memoryStorage();

// ✅ File validation
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {

  const allowedMimeTypes = uploadConfig.allowedMimeTypes 

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new UploadError('Unsupported file type'));
  }

  cb(null, true);
};

// ✅ Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: uploadConfig.maxFileSize
  },
  fileFilter,
});
