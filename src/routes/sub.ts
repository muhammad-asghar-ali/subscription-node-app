import express from "express";
import UserModel from "../models/user"
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";

const router = express.Router();

router.get("/prices", checkAuth, async (req, res) => {
    const prices = await stripe.prices.list({
        apiKey: process.env.STRIPE_SECRET
    })

    res.status(200).json(prices)
})

router.post("/session", checkAuth, async (req, res) => {
    const user = await UserModel.findOne({email: req.user})
    const session = await stripe.checkout.sessions.create(
        {
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: req.body.priceId,
                    quantity: 1
                },
            ],
            success_url: "http://localhost:3000/articles",
            cancel_url: "http://localhost:3000/articles-plan",
            customer: user?.customerStripeId
        }, 
        {
            apiKey: process.env.STRIPE_SECRET
        }
    )
    res.status(200).json(session)
})

export default router;