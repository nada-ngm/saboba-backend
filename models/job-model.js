const mongoose = require("mongoose")

const jobSchema = mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "Title is required"],
            maxlength: [100, "Title can not exceed 100 characters"]
        },

        description: {
            type: String,
            trim: true,
            required: [true, "Description is required"],
            maxlength: [1200, "Description can not exceed 1200 characters"]
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "electrician",
                "carpenter",
                "plumber",
                "cleaner",
                "event worker",
                "shop worker",
                "delivery worker"
            ]
        },

        employer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Employer is required"]
        },

        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true
        },

        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: [50, "Salary must be at least 50 pounds"]
        },

        salaryType: {
            type: String,
            enum: ["daily", "hourly", "fixed"],
            required: [true, "Salary type is required"]     
        },

        jobType: {
            type: String,
            enum: ["part-time", "temporary"],
            required: [true, "Job type is required"] 
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        requiredWorkers: {
            type: Number,
            required: [true, "Number of workers is required"],
            default: 1,
            min: [1, "Minimum number of workers is 1"]
        },

        acceptedWorkers: {
            type: Number,
            default: 0
        },

        requirements: {
            type: [String],
            default: []
        },

        images: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: ["open", "closed", "cancelled"],
            default: "open"
        }
    },

    {
        timestamps: true
    }
)

module.exports = mongoose.model("Job", jobSchema)