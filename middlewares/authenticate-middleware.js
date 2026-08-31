const jwt = require("jsonwebtoken")

const authenticateMiddleware = (req, res, next) => {
    try{
        let token = req.headers.authorization

        if(!token || !token.startsWith("Bearer ")){
            return res.status(401).json({
                status: "fail",
                message: "unauthorized"
            })
        }

        token = token.split(" ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = decoded.id
        req.userRole = decoded.role

        next()
    }catch(err){
        return res.status(401).json({
            status: "fail",
            message: "Invalid or expired token"
        })
    }
}

module.exports = authenticateMiddleware