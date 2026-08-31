const authorizationMiddleware = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.userRole)){
            return res.status(403).json({
                status: "fail",
                messages: "forbidden"
            })
        }

        next()
    }
}

module.exports = authorizationMiddleware