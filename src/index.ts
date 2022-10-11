import express from "express";
import authRoutes from "./routes/auth";
import subRoutes from "./routes/sub"
import articleRoutes from "./routes/article"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
dotenv.config()
const app = express();

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/sub", subRoutes);
app.use("/api/article", articleRoutes);

mongoose.connect(process.env.DB_URL as string);
mongoose.connection
    .once('open', () => { console.log("connection open"); })
    .on('error', err => {
        console.log(err);
        console.log('DB is not connected');
        throw err;
    })
app.listen(8080, () => {
    console.log("app is running in port 8080");
});