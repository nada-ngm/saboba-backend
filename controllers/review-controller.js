const Review = require("../models/review-model")
const User = require("../models/user-model")
const Job = require("../models/job-model")
const deleteUploadedFile = require("../utils/delete-uploaded-file")

const getAllReviews = async (req, res) => {
    try{
        const reviews = await Review.find().populate("reviewer").populate("worker").populate("job")

        res.status(200).json({
            status: "success",
            count: reviews.length,
            data: {reviews}
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching reviews: ${err.message}`
        })
    }
}

const getReviewById = async (req, res) => {
    try{
        const review = await Review.findById(req.params.id).populate("reviewer").populate("worker").populate("job")

        if(!review){
            return res.status(404).json({
                status: "fail",
                message: "Review not found"
            })
        }

        res.status(200).json({
            status: "success",
            data: {review}
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching review: ${err.message}`
        })
    }
}

const getAllWorkerReviews = async (req, res) => {
    try{
        const worker = await User.findOneAndDelete({
            _id: req.params.workerId,
            role: "worker"
        })
        if(!worker){
            return res.status(404).json({
                status: "fail",
                message: "Worker not found"
            })
        }

        const reviews = await Review.find({
            worker: req.params.workerId
        }).populate("reviewer").populate("worker").populate("job")

        res.status(200).json({
            status: "success",
            count: reviews.length,
            data: {reviews}
        })
    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error fetching reviews: ${err.message}`
        })
    }
}

const createReview = async (req, res) => {
    try{
        const worker = await User.findOne({
            _id: req.params.workerId,
            role: "worker",
            workedJobs: req.body.job
        })

        if(!worker){
            return res.status(404).json({
                status: "fail",
                message: "Worker not found"
            })
        }

        const job = await Job.findById(req.body.job)

        if(!job){
            return res.status(404).json({
                status: "fail",
                message: "Job not found"
            })       
        }

        if(job.employer.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })        
        }

        const images = req.files?.map(file=>file.filename) || []

        const newReview = await Review.create({
            ...req.body,
            reviewer: req.userId,
            worker: req.params.workerId,
            images
        })

        res.status(201).json({
            status: "success",
            message: "Review is created successfully",
            data: {
                review: newReview
            }
        })

    }catch(err){

        if(req.files?.length){
            req.files.forEach(file=>{
                deleteUploadedFile("reviews", file.filename)
            })
        }

        res.status(500).json({
            status: "fail",
            message: `Error creating review: ${err.message}`
        })

    }
}

const updateReview = async (req, res) => {
    try{

        const review = await Review.findById(req.params.id)
        if(!review){
            return res.status(404).json({
                status: "fail",
                message: "Review not found"
            })
        }

        if(review.reviewer.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        if(req.body.reviewer !== undefined || req.body.images !== undefined){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden to update this field"
            })
        }

        let oldImages = []

        if(req.files?.length){
            req.body.images = req.files.map(file=>file.filename)
            oldImages = [...review.images]
        }

        Object.assign(review, req.body)
        const updatedReview = await review.save()

        if(oldImages.length){
            oldImages.forEach(file=>{
                deleteUploadedFile("reviews", file)
            })
        }

        res.status(200).json({
            status: "success",
            message: "Review updated successfully",
            data: {
                review: updatedReview
            }
        })

    }catch(err){
        if(req.files?.length){
            req.files.forEach(file=>{
                deleteUploadedFile("reviews", file.filename)
            })
        }
        res.status(500).json({
            status: "fail",
            message: `Error updating review: ${err.message}`
        })
    }
}

const deleteReview = async (req, res) => {
    try{
        const review = await Review.findById(req.params.id)
        if(!review){
            return res.status(404).json({
                status: "fail",
                message: "Review not found"
            })
        }

        if(req.userRole !== "admin" && review.reviewer.toString() !== req.userId){
            return res.status(403).json({
                status: "fail",
                message: "Forbidden"
            })
        }

        await review.deleteOne()

        if(review.images.length){
            review.images.forEach(file=>{
                deleteUploadedFile("reviews", file)
            })
        }

        res.status(200).json({
            status: "success",
            message: "Review is deleted successfully",
            data: {review}
        })

    }catch(err){
        res.status(500).json({
            status: "fail",
            message: `Error deleting review: ${err.message}`
        })
    }
}

module.exports = {
    getAllReviews,
    getReviewById,
    getAllWorkerReviews,
    createReview,
    updateReview,
    deleteReview
}