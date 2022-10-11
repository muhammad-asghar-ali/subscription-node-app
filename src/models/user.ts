import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim:true,
        required: true
    }, 
    password: {
        type: String,
        required: true,
        min: 6
    },
    customerStripeId: {
        type: String,
        requried: true
    }
})

export default mongoose.model("User", userSchema)