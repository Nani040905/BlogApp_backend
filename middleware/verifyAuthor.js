import { UserTypeModel } from "../models/userModel.js";

export const verifyAuthor=async (req,res,next)=>{
    // get author id
    let authorId = req.body?.author || req.params.authorId
    // verify author
    const author = await UserTypeModel.findById(authorId)
    // if author not found
    if (!author) {
        return res.status(401).json({message:"Invalid Author"})
    }
    // if user found but role is different
    if (author.role!=="AUTHOR") {
        return res.status(403).json({message:"User is not an Author"})
    }
    if (!author.isActive){
        return res.status(403).json({message:"Author account is not active"})
    }
    next()
}