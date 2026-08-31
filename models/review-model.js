const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Reviewer is required"]
        },

        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Worker is required"]
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job", 
            required: [true, "Job is required"]
        },

        rate: {
            type: Number,
            required: [true, "Rating is required"],
            max: [5, "Maximum rating is 5"], 
            min: [0, "Minimun rating is 0"]
        }, 

        comment: {
            type: String,
            trim: true,
            max: [500, "Comment can not exceed 500 characters"]
        },

        images: {
            type: [String],
            default: []
        }
    },

    {
        timestamps: true
    }
)

reviewSchema.index(
    {
        reviewer: 1,
        worker: 1, 
        job: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Review", reviewSchema)