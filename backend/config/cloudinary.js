import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredEnvVars.filter((name) => !process.env[name]);
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

if (missingVars.length > 0) {
  console.warn(
    `[cloudinary] Missing env vars: ${missingVars.join(", ")}`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
