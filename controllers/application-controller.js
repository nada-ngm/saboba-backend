const Application = require("../models/application-model")
const Job = require("../models/job-model")
const User = require("../models/user-model")
const deleteUploadedFile = require("../utils/delete-uploaded-file")

const getAllApplications = async (req, res) => {
    try{
        const applications = await Application.find().populate("job").populate("worker")
        
        res.status(200).json({
            status: "success",
            count: applications.length,
            data: {applications}
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching applications: ${err.message}`
        })
    }
}

const getApplicationById = async (req, res) => {
    try{
        const application = await Application.findById(req.params.id).populate("job").populate("worker")

        if(!application){
            return res.status(404).json({
                status: "fail",
                message: "Application not found"
            })
        }

        if(req.userRole !== "admin" &&
            application.job.employer.toString() !== req.userId &&
            application.worker._id.toString() !== req.userId
        ){
            return res.status(403).json({
                status: "fail",
                message: "forbidden"
            })
        }

        res.status(200).json({
            status: "success",
            data: {application}
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching application: ${err.message}`
        })
    }
}

const getAllJobApplications = async (req, res) => {
    try{
        const job = await Job.findById(req.params.jobId)
        if(!job){
            return res.status(404).json({
                status: "fail",
                message: "Job not found"
            })
        }

        if(req.userRole !== "admin" &&
            job.employer.toString() !== req.userId
        ){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        const applications = await Application.find({job: req.params.jobId}).populate("job").populate("worker")

        res.status(200).json({
            status: "success",
            count: applications.length,
            data: {applications}
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching job's applications: ${err.message} `
        })
    }
}

const getAllWorkerApplications = async (req, res) => {
    try{
        const worker = await User.findOne({
            _id: req.params.workerId,
            role: "worker"
        })

        if(!worker){
            return res.status(404).json({
                status: "fail",
                message: "Worker not found"
            })
        }
        if(req.userRole !== "admin" &&
            worker._id.toString() !== req.userId
        ){
            return res.status(403).json({
                status: "fail",
                message: "forbidden"
            })
        }

        const applications = await Application.find({
            worker: req.params.workerId
        }).populate("job")

        res.status(200).json({
            status: "success",
            count: applications.length,
            data: {applications}
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching Worker's applications: ${err.message} `
        })
    }
}

const createApplication = async (req, res) => {
    try{

        const job = await Job.findById(req.body.job)

        if(!job){
            return res.status(404).json({
                status: "fail",
                message: "Job not found"
            })
        }

        const application = await Application.findOne({
            job: req.body.job,
            worker: req.userId
        })

        if(application){
            return res.status(400).json({
                status: "fail",
                message: "Already applied to job"
            })
        }

        const attachments = req.files?.map(file=>file.filename) || []
        const newApplication = await Application.create({
            ...req.body,
            worker: req.userId,
            attachments
        })

        res.status(201).json({
            status: "success",
            message: "Application added successfully",
            data: {
                application: newApplication
            }
        })

    }catch(err){
        if(req.files?.length){
            req.files.forEach(file => {
                deleteUploadedFile("applications", file.filename)
            })
        } 
        
        res.status(500).json({
            status: "fail",
            message: `Error creating application: ${err.message}`
        })
    }
}

const updateApplication = async (req, res) => {
    try{
        const application = await Application.findById(req.params.id).populate("job")
        if(!application){
            return res.status(404).json({
                status: "fail",
                message: "Application not found"
            })
        }

        if(application.worker.toString() !== req.userId &&
            application.job.employer.toString() !== req.userId
        ){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        let oldAttachs = []

        let forbiddenFields

        if(req.userRole === "worker"){
            forbiddenFields = ["job", "worker", "status"]

            if(forbiddenFields.some(field=>field in req.body)){
                return res.status(403).json({
                    status: "fail",
                    message: "Forbidden to update these fields"
                })
            }

            if(req.files?.length){
            oldAttachs = [...application.attachments]
            req.body.attachments = req.files.map(file=>file.filename)
            }

        }else if(req.userRole === "employer"){
            forbiddenFields = ["job", "worker", "message", "attachments"]

            if(forbiddenFields.some(field=>field in req.body)){
                return res.status(403).json({
                    status: "fail",
                    message: "Forbidden to update these fields"
                })
            }
        }

        Object.assign(application, req.body)

        const updatedApplication = await application.save()

        if(oldAttachs.length){
            oldAttachs.forEach(file=>{
                deleteUploadedFile("applications", file)
            })
        }

        res.status(200).json({
            status: "success",
            message: "Application is updated successfully",
            data: {
                application: updatedApplication
            }
        })

    }catch(err){
        if(req.files?.length){
            req.files.forEach(file=>{
                deleteUploadedFile("applications", file.filename)
            })
        }

        res.status(500).json({
            status: "fail", 
            message: `Error updating application: ${err.message}`
        })
    }
}

const deleteApplication = async (req, res) => {
    try{
        const deletedApplication = await Application.findById(req.params.id)
        if(!deletedApplication){
            return res.status(404).json({
                status: "fail",
                message: "Application not found"
            })
        }

        if(req.userRole !== "admin" &&
            deletedApplication.worker.toString() !== req.userId
        ){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        await deletedApplication.deleteOne()

        if(deletedApplication.attachments.length){
            deletedApplication.attachments.forEach(file=>{
                deleteUploadedFile("applications", file)
            })
        }

        res.status(200).json({
            status: "success",
            message: "Application is deleted successfully",
            data: {
                application: deletedApplication
            }
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error deleting application: ${err.message}`
        })
    }
}

const acceptApplication = async (req, res) => {
    try{
        const application = await Application.findById(req.params.id).populate("job").populate("worker")
        if(!application){
            return res.status(404).json({
                status: "fail",
                message: "Application not found"
            })
        }

        if(application.job.employer.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        if(application.job.status !== "open" || application.job.requiredWorkers <= application.job.acceptedWorkers){
            return res.status(400).json({
                status: "fail",
                message: "Can not accept applications for this job"
            })
        }

        if(application.status === "accepted"){
            return res.status(400).json({
                status: "fail",
                message: "Can not accept application twice"
            })
        }

        application.status = "accepted"
        application.job.acceptedWorkers++
        application.worker.workedJobs.push(application.job._id)

        await application.save()
        await application.job.save()
        await application.worker.save()

        res.status(200).json({
            status: "success",
            message: "Application is accepted successfully",
            data: {
                application
            }
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error accepting application: ${err.message}`
        })
    }
}

module.exports = {
    getAllApplications,
    getApplicationById,
    getAllJobApplications,
    getAllWorkerApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    acceptApplication
}
