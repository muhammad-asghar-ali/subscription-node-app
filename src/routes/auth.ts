import express from "express";
import { body, validationResult } from "express-validator"
import bcrpyt from "bcryptjs"
import jwt from "jsonwebtoken"
import UserModel from "../models/user"
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";
const router = express.Router();

router.post("/signup",
    body("email").isEmail().withMessage("the email is invalid"),
    body("password").isLength({ min: 6 }).withMessage("the password is invalid"),
    async (req, res) => {
        const validationError = validationResult(req)

        if (!validationError.isEmpty()) {
            const errors = validationError.array().map(error => {
                return {
                    err: error.msg
                }
            })
            return res.status(400).json({ errors, data: null })
        }

        const { email, password } = req.body

        const checkUser = await UserModel.findOne({ email })
        if (checkUser) {
            return res.status(400).json({
                errors: [
                    {
                        msg: "Email already in use"
                    }
                ],
                data: null
            })
        }

        const hashPassword = await bcrpyt.hash(password, 10)

        const customer = await stripe.customers.create({
            email
        }, {
            apiKey: process.env.STRIPE_SECRET
        })

        const user = await UserModel.create({
            email,
            password: hashPassword,
            customerStripeId: customer.id
        })

        const token = await jwt.sign(
            { email: user.email },
            process.env.SECRET as string,
            {
                expiresIn: 36000
            }
        )

        res.status(200).json({
            errors: [],
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    stripeCustomer: customer.id
                }
            }
        })

    })

router.post("/signin", async (req, res) => {
    const { email, password } = req.body

    const user = await UserModel.findOne({ email })
    if (!user) {
        return res.status(400).json({
            errors: [
                {
                    msg: "invalid credentials"
                }
            ],
            data: null
        })
    }

    const ismatch = await bcrpyt.compare(password, user.password)
    if (!ismatch) {
        return res.status(400).json({
            errors: [
                {
                    msg: "invalid credentials"
                }
            ],
            data: null
        })
    }

    const token = await jwt.sign(
        { email: user.email },
        process.env.SECRET as string,
        {
            expiresIn: 36000
        }
    )

    res.status(201).json({
        errors: [],
        data: {
            token,
            user: {
                id: user._id,
                email: user.email
            }
        }
    })
})

router.get("/me", checkAuth, async (req, res) => {
    const user = await UserModel.findOne({ email: req.user })

    if(!user) {
        return res.status(404).json({
            errors: [
                {
                    msg: "user not exist"
                }
            ],
            data: null
        })
    }
    res.status(200).json({
        errors: [],
        data: {
            id: user._id,
            email: user.email

        }
    })

})

export default router;