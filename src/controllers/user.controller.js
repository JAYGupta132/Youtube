import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong when generating Access and refresh token");
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to the cloudinary, and check for avatar
    // create user object - create entry in db and check for user
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password} = req.body
    // console.log("Email ", email)

    if (
        [fullName, email, username, password].some((field) => 
            field?.trim() === ""
        )
    ) {
        throw new ApiError(404, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User with email or username is already existing")
    }

    // const localAvatarPath = req.files?.avatar[0]?.path
    let localAvatarPath;
    if (req.files && Array.isArray(req.files.avatar) && (req.files.avatar).length > 0 ) {
        localAvatarPath = req.files.avatar[0].path
    }

    // const localCoverImagePath = req.files?.coverImage[0]?.path
    let localCoverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && (req.files.coverImage).length > 0 ) {
        localCoverImagePath = req.files.coverImage[0].path
    }

    if (!localAvatarPath) {
        throw new ApiError(404, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(localAvatarPath)
    const coverImage = await uploadOnCloudinary(localCoverImagePath)

    if (!avatar) {
        throw new ApiError(404, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // get email and password from user
    // check in the database
    // if existing generate an access token and refresh token and send cookie
    // if not existing throw an error

    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email required")
    }

    // Here is the alternative of above base on value getting from user
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email required")
    // }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user is not registered")
    }

    const isValidUser = await user.isPasswordCorrect(password)

    if (!isValidUser) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") 

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken 
            },
            "User LoggedIn successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    const user = req.user._id

    await User.findByIdAndUpdate(
        user,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User successfully LoggedOut")
    )
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    // console.log("incomingRefreshToken: ", incomingRefreshToken)

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)
        
        const user = User.findById(decodedToken._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        )       
    } catch (error) {
        throw new ApiError(401, "Failed to create accessToken")
    }

})
export { registerUser, loginUser, logoutUser, refreshAccessToken }