import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js'
import { UserTypeModel } from '../models/userModel.js';
import { ArticleModel } from '../models/articleModel.js';
import { checkAdmin } from '../middleware/checkAdmin.js'
export const adminRoute = express.Router();

//Read all articles
adminRoute.get('/articles', verifyToken, async (req, res) => {
    //find all articles from database
    let articles = await ArticleModel.find();

    //send response
    res.status(200).json({ message: "All articles", payload: articles });
})


//Block User
adminRoute.put('/block-user', verifyToken, checkAdmin, async (req, res) => {
    //get details of the user form req
    let { userId, adminId } = req.body;
    //verify admin
    let admin = await UserTypeModel.findById(adminId);
    if (!admin) {
        return res.status(403).json({ message: "User not found" });
    }

    //update the user 
    let updatedUser = await UserTypeModel.findByIdAndUpdate(userId, { $set: { isActive: false } }, { new: true });
    delete updatedUser.password

    //send response
    res.status(200).json({ message: "User blocked successfully", payload: updatedUser });
})


//Unblock user
adminRoute.put('/unblock-user', verifyToken, checkAdmin, async (req, res) => {
    //get details of the user form req
    let { userId, adminId } = req.body;
    //verify admin
    let admin = await UserTypeModel.findById(adminId);
    if (!admin) {
        return res.status(403).json({ message: "User not found" });
    }

    //update the user 
    let updatedUser = await UserTypeModel.findByIdAndUpdate(userId, { $set: { isActive: true } }, { new: true });
    delete updatedUser.password

    //send response
    res.status(200).json({ message: "User unblocked successfully", payload: updatedUser });
})