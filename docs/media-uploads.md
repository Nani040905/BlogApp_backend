# 🖼️ Media Uploads, Multer & Cloudinary Integration

This document details the configuration and pipelines for handling image uploads, validating file formats, streaming assets to **Cloudinary**, and managing database rollbacks on failure.

---

## 🏗️ Visual Media Upload Pipeline

The application processes user profile uploads dynamically in memory, ensuring no temporary files leak onto local disk drives:

```text
[Frontend Registration Form]
     │ (multipart/form-data with profileImageUrl image)
     ▼
[Multer Memory Middleware] -> Validates file size (<2MB) & MIME type (JPG/PNG)
     │
     ├──► [MIME/Size Invalid] ──► Return 400 Bad Request
     ▼
[Buffer Object (req.file.buffer)]
     │
     ▼
[Cloudinary Upload Helper] -> Streams buffer to Cloudinary over HTTPS
     │
     ├──► [Upload Success] ─────► Extract secure_url & public_id
     │                                 │
     │                                 ▼
     │                      [MongoDB userDoc.save()]
     │                                 │
     │            ┌────────────────────┴────────────────────┐
     │            ▼ [Database Save Success]                 ▼ [Database Save Failure]
     │     [Return 201 Created]                     [FAIL-SAFE ROLLBACK]
     │                                                      │
     │                                                      ▼
     │                                           [Cloudinary destroy()]
     │                                           (Deletes uploaded image immediately)
     │                                                      │
     │                                                      ▼
     │                                            [Return 400/409 Error]
```

---

## 📁 Multer Memory Configuration (`config/multer.js`)

Multer intercepts registration requests, checking file metadata before passing it to memory storage:

```javascript
export const upload = multer({
  storage: multer.memoryStorage(), // Keeps file as a buffer in RAM to prevent disk space leaks
  limits: {
      fileSize: 2 * 1024 * 1024,   // Rejects files larger than 2MB
  },
  fileFilter: (req, file, cb) => {
      // Security check: strictly validate MIME types
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
          cb(null, true);
      } else {
          const err = new Error("Only JPG and PNG allowed");
          err.status = 400;
          cb(err, false);
      }
  }
});
```

---

## ☁️ Cloudinary SDK Integration (`config/cloudinary.js`)

Cloudinary credentials are loaded securely from the environment configuration:

```javascript
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
```

### ⚡ Upload Stream Wrapper (`config/cloudinaryUpload.js`)
Since the files are stored in memory, we stream them directly to Cloudinary:

```javascript
export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
          { folder: "blog_users" }, // Saved inside the blog_users folder
          (err, result) => {
              if (err) return reject(err);
              resolve(result);
          }
      );
      stream.end(buffer); // Ends stream and flushes buffer to Cloudinary
  });
};
```

---

## 🛡️ Fail-Safe Database Rollback Routine

If an image upload succeeds but the user registration subsequently fails database validation (e.g. duplicate email conflicts), the orphaned image is deleted from Cloudinary immediately:

```javascript
let cloudinaryResult;

try {
    let userObj = req.body;
    
    // Step 1: Upload image to Cloudinary from memory buffer
    if (req.file) {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }
    
    // Step 2: Register user in MongoDB
    const newUserObj = await register({
        ...userObj,
        role: "USER", // Or AUTHOR
        profileImageUrl: cloudinaryResult?.secure_url,
    });
    
    res.status(201).json({ message: "user created", payload: newUserObj });

} catch (err) {
    // Step 3: ROLLBACK (Delete orphan image if database save failed)
    if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    
    next(err); // Forward the validation error to central middleware
}
```
This ensures Cloudinary storage remains clean and free of orphaned images.
