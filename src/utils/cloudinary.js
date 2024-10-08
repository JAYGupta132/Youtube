import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' in the Cloudinary site to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  // Upload an image
  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // console.log("File is uploaded on cloudinary", uploadResult);
    fs.unlinkSync(localFilePath)
    return uploadResult;

    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });

    // console.log(optimizeUrl);

    // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });

    // console.log(autoCropUrl);
  } catch (error) {
    fs.unlinkSync(localFilePath); // removed the locally saved temporary file as the upload operation got failed
    return null;
  }
};


export { uploadOnCloudinary }