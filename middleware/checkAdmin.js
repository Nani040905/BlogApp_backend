import { UserTypeModel } from "../models/userModel.js";

export const checkAdmin = async(req, res, next)=>{
    //get adminId
    let adminId = req.body?.adminId || req.params?.adminId;

    //check if admin exists in database or not
    let admin = await UserTypeModel.findById(adminId);
    if(!admin) {
        return res.status(403).json({ message: "User not found" })
    }

    //check for the role
    if(admin.role != "ADMIN") {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    //execute next
    next();
}