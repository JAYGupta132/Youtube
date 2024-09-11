const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }


// const asyncHandler = () => {}
// const asyncHandler = () => {() => {}}
// const asyncHandler = () => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         return await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: failed,
//             message: error.message
//         })
//     }
// };