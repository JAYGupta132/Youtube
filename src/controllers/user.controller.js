import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "OK"
    })
})

const login = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Getting Routes"
    })
})


export {registerUser, login}