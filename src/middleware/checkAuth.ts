import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.header("authorization")

    if (!token) {
        res.status(403).json({
            errors: [
                { msg: "Unauthorized" }
            ]
        })
    }

    token = token?.split(" ")[1]
 
    try{
        if(token) {
            const user = await jwt.verify(token, process.env.SECRET as string) as {email: string}
            req.user = user.email           
        }
    } catch(error) {
        res.status(403).json({
            errors: [
                { msg: "Unauthorized" }
            ]
        })
    }

    next()
}