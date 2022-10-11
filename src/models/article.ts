import mongoose  from "mongoose";

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        requried: true
    },
    access: {
        type: String,
        enum: ["Basic", "Standard", "Premium"],
        requried: true
    }
})

export default mongoose.model("Article", articleSchema)