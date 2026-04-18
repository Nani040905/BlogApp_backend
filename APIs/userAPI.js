import express from 'express'
import { register, authenticate } from '../services/authService.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { ArticleModel } from '../models/articleModel.js'
import { upload } from '../config/multer.js'
import cloudinary from '../config/cloudinary.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'

export const userRoute = express.Router()


// Register user
userRoute.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
    let cloudinaryResult;

    try {
        let userObj = req.body;
        //  Step 1: upload image to cloudinary from memoryStorage (if exists)
        if (req.file) {
            cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        }
        // Step 2: call existing register()
        const newUserObj = await register({
            ...userObj,
            role: "USER",
            profileImageUrl: cloudinaryResult?.secure_url,
        });

        res.status(201).json({
            message: "user created",
            payload: newUserObj,
        });

    } catch (err) {

        // Step 3: rollback 
        if (cloudinaryResult?.public_id) {
            await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        }

        next(err); // send to your error middleware
    }

}
);


// Read all articles
userRoute.get("/articles", verifyToken("USER"), async (req, res) => {
    //read articles
    let articles = await ArticleModel.find({ isArticleActive: true }).populate("author", "firstName email")
    //send res
    res.status(200).json({ message: "articles", payload: articles })
})


// Add comments to an article
userRoute.put("/articles", verifyToken("USER"), async (req, res) => {
    //get modified article from req
    const { articleId, user, comment } = req.body
    // check user
    if (req.user.userId !== user) {
        return res.status(403).json({ message: "Forbidden." })
    }
    //find article by id and update
    let updatedArticle = await ArticleModel.findOneAndUpdate({ _id: articleId, isArticleActive: true },
        { $push: { comments: { user, comment } } }, { new: true, runValidators: true }
    ).populate("comments.user", "firstName profileImageUrl")
    //if article not found
    if (!updatedArticle) {
        return res.status(404).json({ message: "article not found" })
    }

    //send response
    res.status(200).json({ message: "comment added successfully", payload: updatedArticle })
})