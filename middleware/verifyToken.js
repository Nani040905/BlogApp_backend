import jwt, { decode } from 'jsonwebtoken'
import {config} from 'dotenv'
config()



export const verifyToken=(... allowedRoles)=>{
    return async (req,res,next)=>{
        try{
            //read token from req
            let token = req.cookies.token
            if (!token) {
              return res.status(400).json({message:"Unauthorized request. Please Login"})
            }
            //verify the validity of the token(decoding the token)
            const decodedToken = jwt.verify(token,process.env.JWT_SECRET)

            // check if role is allowed 
            if (!allowedRoles.includes(decodedToken.role)){
              return res.status(403).json({message:"Forbidden. You don't have access to this resource "})
            }

            //attah user info to req for use in routes
            req.user = decodedToken;

            //farword to next middleware
            next()
        }
        catch(err){
            if (err.name === "TokenExpiredError"){
                return res.status(401).json({message:"Session expired.please login again "})
            }
            if (err.name === "TokenExpiredError"){
                return res.status(401).json({message:"Invalid Token .please retry "})
            }
            next(err)
        }
    }
}