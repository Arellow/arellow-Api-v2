// server.js - Main Express Server File
// Integrate this with your existing app. Assumes you have .env for JWT_SECRET, Cloudinary, DB_URL, etc.
// Run: npm i express prisma @prisma/client socket.io jsonwebtoken multer multer-storage-cloudinary cloudinary cors dotenv

// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';
// import multer from 'multer';
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';

// // Config
// dotenv.config();
// const app = express();
// const server = http.createServer(app);
// const prisma = new PrismaClient(); // Your Prisma instance
// const PORT = process.env.PORT || 3000;

// // Cloudinary config (from your upload middleware)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// Middleware
// app.use(cors({ origin: '*' })); // Tighten for prod
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Auth Middleware (stub - adapt your existing '../../../middlewares/auth.middleware')
// const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token' });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id: string, ... }
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };

// // Upload Middleware (your provided code)
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'chat-media',
//     allowed_formats: ['jpg', 'png', 'mp4', 'mp3', 'wav', 'pdf'],
//     resource_type: 'auto',
//   },
// });
// const upload = multer({ storage });


// Chat Routes (your code, updated with fixes)



