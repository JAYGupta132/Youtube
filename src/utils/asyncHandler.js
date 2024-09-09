const asyncHandler = (requestHandler) => {
    () => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}



export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = () => {() => {}}
// const asyncHandler = () => async () => {}


// const asyncHandler = (fn) => (req, res, next) => {
//     try {

//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: failed,
//             message: error.message
//         })
//     }
// };