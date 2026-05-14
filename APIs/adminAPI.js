import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js'
import { UserTypeModel } from '../models/userModel.js';
import { ArticleModel } from '../models/articleModel.js';

export const adminRoute = express.Router();

// Get all articles (with author details)
adminRoute.get('/articles', verifyToken("ADMIN"), async (req, res) => {
    let articles = await ArticleModel.find().populate("author", "firstName lastName email profileImageUrl");
    res.status(200).json({ message: "All articles", payload: articles });
})

// Get all users (role: USER)
adminRoute.get('/users', verifyToken("ADMIN"), async (req, res) => {
    let users = await UserTypeModel.find({ role: "USER" }).select("-password");
    res.status(200).json({ message: "All users", payload: users });
})

// Get all authors (role: AUTHOR)
adminRoute.get('/authors', verifyToken("ADMIN"), async (req, res) => {
    let authors = await UserTypeModel.find({ role: "AUTHOR" }).select("-password");
    res.status(200).json({ message: "All authors", payload: authors });
})

// Block/Unblock User or Author
adminRoute.put('/toggle-user-status/:userId', verifyToken("ADMIN"), async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body; // New status

    const updatedUser = await UserTypeModel.findByIdAndUpdate(
        userId,
        { $set: { isActive } },
        { new: true }
    ).select("-password");

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
        message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`, 
        payload: updatedUser 
    });
})

// Block/Unblock Article
adminRoute.put('/toggle-article-status/:articleId', verifyToken("ADMIN"), async (req, res) => {
    const { articleId } = req.params;
    const { isArticleActive } = req.body; // New status

    const updatedArticle = await ArticleModel.findByIdAndUpdate(
        articleId,
        { $set: { isArticleActive } },
        { new: true }
    ).populate("author", "firstName lastName email profileImageUrl");

    if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ 
        message: `Article ${isArticleActive ? 'activated' : 'deactivated'} successfully`, 
        payload: updatedArticle 
    });
})