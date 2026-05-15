export const storageConfig = {
  maxFileSize: 10 * 1024 * 1024,

  allowedMimeTypes: [
    "application/pdf",

    "text/plain",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  presignedExpiresIn: 60 * 5,
};
