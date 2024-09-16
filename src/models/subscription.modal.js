import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // one who is subscribing the channel
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // one to whom 'subscriber' is subscribing
    }
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)