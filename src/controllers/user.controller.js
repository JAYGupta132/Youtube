import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("Email ", email)

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

const login = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Getting Routes"
    })
})


export {registerUser, login}