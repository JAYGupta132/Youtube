// require('dotenv').config({path: "./env"})
import dotenv from 'dotenv'
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB()
.then()
.catch((err) => {
    console.log("MONGODB connection failed")
})

/*
import express from "express";
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Database ERR:", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`server is listening on the port: ${process.env.PORT}`)
        })
    }catch (error){
        console.error("ERROR:", error)
        throw error
    }
})()
*/