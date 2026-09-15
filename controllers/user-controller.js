const User = require("../models/user-model")
const deleteUploadedFile = require("../utils/delete-uploaded-file")
const bcryptjs = require("bcryptjs")

const getAllWorkers = async (req, res) => {
    try{
        const workers = await User.find({role: "worker"})
        const workersData = workers.map(worker=>{
            return {
                _id: worker._id,
                firstName: worker.firstName,
                lastName: worker.lastName,
                email: worker.email,
                role: worker.role,
                phone: worker.phone,
                location: worker.location,
                profileImage: worker.profileImage,
                bio: worker.bio,
                skills: worker.skills,
                experience: worker.experience,
                availability: worker.availability,
                workedJobs: worker.workedJobs,
                isActive: worker.isActive,
                createdAt: worker.createdAt,
                updatedAt: worker.updatedAt
            }
        })

        res.status(200).json({
            status: "success",
            count: workersData.length,
            data: {
                workers: workersData
            }
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching workers: ${err.message}`
        })
    }
}

const getAllEmployers = async (req, res) => {
    try{
        const employers = await User.find({role: "employer"})
        const employersData = employers.map(employer=>{
            return {
                _id: employer._id,
                firstName: employer.firstName,
                lastName: employer.lastName,
                email: employer.email,
                role: employer.role,
                phone: employer.phone,
                profileImage: employer.profileImage,
                bio: employer.bio,
                location: employer.location,
                isActive: employer.isActive,
                createdAt: employer.createdAt,
                updatedAt: employer.updatedAt
            }
        })

        res.status(200).json({
            status: "success",
            count: employersData.length,
            data: {
                employers: employersData
            }
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching employers: ${err.message}`
        })
    }
}

const getUsersById = async (req, res) => {
    try{

        const user = await User.findById(req.params.id)

        if(!user){
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            })
        }

        let userData

        if(user.role === "worker"){
            userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage,
                bio: user.bio,
                skills: user.skills,
                experience: user.experience,
                availability: user.availability,
                workedJobs: user.workedJobs,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
                
            }
        }else if(user.role === "employer"){
            userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage,
                bio: user.bio,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }    
        }

        res.status(200).json({
            status: "success",
            data: {
                user: userData
            }
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching user ${err.message}`
        })
    }
}

const updateWorker = async (req, res) => {
    try{
        const worker = await User.findById(req.params.id)
        if(!worker || worker.role !== "worker"){
            return res.status(404).json({
                status: "fail",
                message: "Worker not found"
            })
        }

        if(worker._id.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        const forbiddenFields = ["email", "password", "role", "workedJobs"]
        if(forbiddenFields.some(field=> field in req.body)){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden to update these fields"
            })
        }

        if("skills" in req.body){

            if(Array.isArray(req.body.skills)){
                req.body.skills = req.body.skills
            }else{
                req.body.skills = [req.body.skills]
            }

        }

        let oldImage = "default-profile-picture.webp"

        if(req.file){
            oldImage = worker.profileImage
            req.body.profileImage = req.file.filename
        }

        Object.assign(worker, req.body)
        await worker.save()

        if(oldImage !== "default-profile-picture.webp") deleteUploadedFile("users", oldImage)

        res.status(200).json({
            status: "success",
            message: "Worker is updated successfully",
            data: {worker}
        })

    }catch(err){

        if(req.file) deleteUploadedFile("users", req.file.filename)

        res.status(500).json({
            status: "fail",
            message: `Error updating worker: ${err.message}`
        })
    }
}

const updateEmployer = async (req, res) => {
    try{
        const employer = await User.findById(req.params.id)
        if(!employer || employer.role !== "employer"){
            return res.status(404).json({
                status: "fail",
                message: "employer not found"
            })
        }

        if(employer._id.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        const forbiddenFields = ["email", "password", "role", "skills", "experience", "availability", "workedJobs"]
        if(forbiddenFields.some(field=> field in req.body)){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden to update these fields"
            })
        }

        let oldImage = "default-profile-picture.webp"

        if(req.file){
            oldImage = employer.profileImage
            req.body.profileImage = req.file.filename
        }

        Object.assign(employer, req.body)
        await employer.save()

        if(oldImage !== "default-profile-picture.webp") deleteUploadedFile("users", oldImage)

        const employerData ={
                firstName: employer.firstName,
                lastName: employer.lastName,
                email: employer.email,
                role: employer.role,
                phone: employer.phone,
                profileImage: employer.profileImage,
                bio: employer.bio,
                isActive: employer.isActive
        }

        res.status(200).json({
            status: "success",
            message: "employer is updated successfully",
            data: {employerData}
        })

    }catch(err){

        if(req.file) deleteUploadedFile("users", req.file.filename)
        
        res.status(500).json({
            status: "fail",
            message: `Error updating employer: ${err.message}`
        })
    }
}

const updatePassword = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select("+password")
        if(!user){
            return res.status(404).json({
                status: "fail",
                message: "user not found"
            })
        }

        if(user._id.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        const comparedPass = await bcryptjs.compare(req.body.currentPassword, user.password)
        if(!comparedPass){
            return res.status(400).json({
                status: "fail",
                message: "Wrong Password"
            })
        }

        user.password = req.body.newPassword

        await user.save()

        res.status(200).json({
            status: "success",
            message: "Password is updated successfully"
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error updating password: ${err.message}`
        })
    }
}

const deleteUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({
                status: "fail",
                message: "user not found"
            })
        }

        if (req.userRole !== "admin" && user._id.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        await user.deleteOne()

        if(user.profileImage!=="default-profile-picture.webp") deleteUploadedFile("users", user.profileImage)

        res.status(200).json({
            status: "success",
            message: "User is deleted successfully",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error deleting user: ${err.message}`
        })
    }
}

module.exports = {
    getAllWorkers,
    getAllEmployers,
    getUsersById,
    updateWorker,
    updateEmployer,
    updatePassword,
    deleteUser
}
