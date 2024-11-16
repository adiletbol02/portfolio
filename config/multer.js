const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Configure Multer to Use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "portfolio_images", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Restrict to image formats
  },
});

const upload = multer({ storage });

module.exports = upload;
