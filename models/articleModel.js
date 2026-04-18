import { Schema, model } from 'mongoose'

// Create user comment schema
const userCommentSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    comment:{
        type:String
    }
})

// Create article schema
const articleSchema = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:[true,"Author ID required"]
    },
    title:{
        type:String,
        required:[true,"Title is required"]
    },
    category:{
        type:String,
        required:[true,"Category is required"]
    },
    content:{
        type:String,
        required:[true,"Content is required"]
    },
    comments:[userCommentSchema],
    isArticleActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true,
    strict:"throw",
    versionKey:false
})

//create article model
export const ArticleModel = model('article',articleSchema)