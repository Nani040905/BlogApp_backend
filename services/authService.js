import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {UserTypeModel} from '../models/userModel.js'
import { config } from 'dotenv';
config()


// register function
export const register = async (userObj)=>{
    //Create document
    const userDoc = new UserTypeModel(userObj)

    //validate for empty password
    await userDoc.validate()

    //hash and replace plain password 
    userDoc.password = await bcrypt.hash(userObj.password,12)

    //save 
    await  userDoc.save()

    //convert document to object to remove password
    const newUserObj = userDoc.toObject()

    //remove password
    delete newUserObj.password

    //return user obj without password
    return newUserObj
}

// Authenticate function
export const authenticate = async ({email,password})=>{
    let user = await UserTypeModel.findOne({email})
    if (user===null) {
        const err =new Error("Invalid email")
        err.status = 401
        throw err
    }
    //if user valid ,but blocked by admin
    
    // compare password
    let passwordStatus = await bcrypt.compare(password,user.password)
    if (passwordStatus===false) {
        const err =new Error("Invalid password")
        err.status = 401
        throw err
    }
    //generate token
    let token = jwt.sign(
        {
          userId: user._id,
          _id: user._id,
          role: user.role,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          firstName: user.firstName,
          lastName: user.lastName
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    )
    const userObj = user.toObject()
    delete userObj.password
    return {token,user:userObj}
}