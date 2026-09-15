const User = require("../models/user-model")
const deleteuploadedfile = require("../utils/delete-uploaded-file")
const generateToken = require("../utils/get-jwt")
const bcryptjs = require("bcryptjs")

const signup = async (req, res) => {

    const { role } = req.body

    if (role !== "worker" && role !== "employer") {
        return res.status(400).json({
            message: "Role must be either worker or employer"
        })
    }

    try{

        let skills =[]
        
        if(req.body.skills){
            skills = JSON.parse(req.body.skills)
        }

        const user = await User.create({
            ...req.body,
            skills,
            profileImage: req.file?.filename
        })

        const token = generateToken(user)
        res.status(201).json({
            status: "success",
            message: "User created successfully",
            token,
            data: {user}
        })

    }catch(err){
        if(req.file){
            deleteuploadedfile("users", req.file.filename)
        }
        res.status(500).json({
            status: "fail",
            message: `error in signUp ${err.message}`
        })
    }
}

const signin = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                status: "fail",
                message: "Email and Password are required"
            })
        }

        const user = await User.findOne({email}).select("+password")
        if(!user){
            return res.status(400).json({
                status: "fail",
                message: "Invalid Email or Password"
            })
        }

        const comparedPass = await bcryptjs.compare(password, user.password)

        if(!comparedPass){
            return res.status(400).json({
                status: "fail",
                message: "Invalid Email or Password"
            })
        }

        user.password = undefined

        const token = generateToken(user)

        res.status(200).json({
            status: "success",
            message: "User logged in successfully", 
            token,
            data: {user}
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error in SignIn ${err.message}`
        })
    }
}

module.exports = {signup, signin}