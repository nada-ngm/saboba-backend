const Job = require("../models/job-model")
const deleteUploadedFile = require("../utils/delete-uploaded-file")

const getAllJobs = async (req, res) => {
    try{
        const jobs = await Job.find().populate("employer")

        res.status(200).json({
            status: "success",
            count: jobs.length,
            data: {jobs}
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching Jobs ${err.message}`
        })
    }
}

const getJobById = async (req, res) => {
    try{
        const job = await Job.findById(req.params.id).populate("employer")

        if(!job){
            return res.status(404).json({
                status: "fail",
                message: "Job not found"
            })
        }

        res.status(200).json({
            status: "success",
            data: {job}
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching job: ${err.message}`
        })
    }
}

const createJob = async (req, res) => {
    try{

        const images = req.files?.map(file=>file.filename) || []
        const newJob = await Job.create({
            ...req.body,
            employer: req.userId,
            images
        })

        res.status(201).json({
            status: "success",
            message: "Job is created successfully",
            data: {
                job: newJob
            }
        })
    }catch(err){
        if(req.files?.length){
            req.files.forEach(file => {
                deleteUploadedFile("jobs", file.filename)
            })
        }

        res.status(500).json({
            status: "fail",
            message: `Error creating job: ${err.message}`
        })
    }
}

const UpdateJob = async (req, res) => {
    try{
        const job = await Job.findById(req.params.id)

        if(!job){
            return res.status(404).json({
                status: "fail",
                message: "Job not found"
            })
        }

        if (req.userId !== "admin" && job.employer.toString() !== req.userId) {
            return res.status(403).json({
                status: "fail",
                message: "Not allowed to make changes on this job"
            })
        }

        if(req.body.employer !== undefined){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden to update this field"
            })
        }

        let oldImages = []

        if(req.files?.length){
            req.body.images = req.files.map(file=>file.filename)
            if(job.images.length) oldImages = [...job.images]
        }

        Object.assign(job, req.body)
        const updatedJob = await job.save()

        if(oldImages.length){
            oldImages.forEach(file=>{
                deleteUploadedFile("jobs", file)
            })     
        }

        res.status(200).json({
            status: "success",
            message: "Job updated successfully",
            data: {
                job: updatedJob
            }
        })

    }catch(err){
        if(req.files?.length){
            req.files.forEach(file=>{
                deleteUploadedFile("jobs", file.filename)
            })
        }

        res.status(500).json({
            status: "fail",
            message: `Error updating job: ${err.message}`
        })
    }
}

const deleteJob = async (req, res) => {
    try{
        const deletedJob = await Job.findById(req.params.id)

        if(!deletedJob){
            return res.status(404).json({
                status: "fail",
                message: "Job not found"
            })
        }

        if (req.userId !== "admin" && deletedJob.employer.toString() !== req.userId) {
            return res.status(403).json({
                status: "fail",
                message: "Not allowed to delete this job"
            })
        }

        await deletedJob.deleteOne()

        if(deletedJob.images.length){
            deletedJob.images.forEach(file=>{
                deleteUploadedFile("jobs", file)
            })
        }

        res.status(200).json({
            status: "success",
            message: "Job is deleted successfully",
            data: {
                job: deletedJob
            }
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error deleting job: ${err.message}`
        })
    }
}

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    UpdateJob,
    deleteJob
}