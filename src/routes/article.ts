import express from "express";
import UserModel from "../models/user"
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";
import ArticleModel from "../models/article";
const router = express.Router();

router.get("/", checkAuth, async (req, res) => {
    const user = await UserModel.findOne({email: req.user})

    const subscription = await stripe.subscriptions.list(
        {
            customer: user?.customerStripeId,
            status: "all",
            expand: ["data.default_payment_method"],
        }, {
            apiKey: process.env.STRIPE_SECRET
        }
    )

    if(!subscription.data.length) return res.status(200).json([])
    
    //@ts-ignore
    const plan = subscription.data[0].plan.nickname

    if(plan === "Basic") {
        const articles = await ArticleModel.find({access: "Basic"})
        return res.status(200).json(articles)
    } else if(plan === "Standard") {
        const articles = await ArticleModel.find({ access: {$in: ["Basic", "Standard"]}})
        return res.status(200).json(articles)
    } else {
        const articles = await ArticleModel.find({})
        return res.status(200).json(articles)
    }
})


export default router;