import express from 'express'
import { register } from '../services/authService.js'
import { ArticleModel } from '../models/articleModel.js'
import { verifyAuthor } from '../middleware/verifyAuthor.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { upload } from '../config/multer.js'
import cloudinary from '../config/cloudinary.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'



export const authorRoute = express.Router()

// Register author (public)
authorRoute.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
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
            role: "AUTHOR",
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

// create article (protected)
authorRoute.post("/articles", verifyToken("AUTHOR"), async (req, res) => {
    //get article form req
    const articleObj = req.body
    //create article document
    const articleDoc = new ArticleModel(articleObj)

    //save
    let savedArticle = await articleDoc.save()

    //send res
    res.status(201).json({ message: "article created", payload: savedArticle.toObject() })
})

// Read articles of author which are active (protected)
authorRoute.get("/articles/:authorId", verifyToken("AUTHOR"), async (req, res) => {
    //get author by id
    let authorId = req.params.authorId
    //read articles by this author
    let articles = await ArticleModel.find({ author: authorId }).populate("author", "firstName email")
    //send res
    res.status(200).json({ message: "articles", payload: articles })
})

// Edit article (protected)
authorRoute.put("/articles", verifyToken("AUTHOR"), async (req, res) => {
    //get modified article from req
    let { articleId, title, content, category } = req.body
    //find article
    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: req.body.author })
    if (!articleOfDB) {
        res.status(404).json({ message: "article not found" })
    }
    //update article
    let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId, {
        $set: {
            title,
            content,
            category
        }
    },
        { new: true })
    //send res
    res.status(200).json({ message: "article updated", payload: updatedArticle })

})

// Delete article (soft delete) (protected)
authorRoute.delete('/articles/authorId/:authorId/articleId/:articleId', verifyToken("AUTHOR"), async (req, res) => {
    let articleId = req.params.articleId
    let authorId = req.params.authorId
    //find article
    if (req.user.userId !== authorId) {
        return res.status(403).json({ message: "Forbidden." })
    }
    //delete article
    let article = await ArticleModel.findByIdAndUpdate(articleId, { $set: { isArticleActive: false } }, { new: true })
    if (!article) {
        res.status(404).json({ message: "article not found" })
    }
    //send res
    res.status(200).json({ message: "article deleted", payload: article })

})

// Restore
authorRoute.patch('/articles/authorId/:authorId/articleId/:articleId', verifyToken("AUTHOR"), async (req, res) => {
    let articleId = req.params.articleId
    let authorId = req.params.authorId
    //find article
    if (req.user.userId !== authorId) {
        return res.status(403).json({ message: "Forbidden." })
    }
    //delete article
    let article = await ArticleModel.findByIdAndUpdate(articleId, { $set: { isArticleActive: true } }, { new: true })
    if (!article) {
        res.status(404).json({ message: "article not found" })
    }
    //send res
    res.status(200).json({ message: "article restored", payload: article })

})

