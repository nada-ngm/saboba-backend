const mongoose = require("mongoose")

const applicationSchema = mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: [true, "Job is required"]
        },

        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Worker is required"]
        },

        status: {
            type: String,
            required: [true, "Status is required"],
            enum: [
                "accepted",
                "rejected",
                "pending",
                "withdrawn"
            ],
            default: "pending"
        },

        message: {
            type: String,
            trim: true,
            maxlength: [500, "Message can not exceed 500 characters"]
        },

        attachments: {
            type: [String],
            default: []
        }
    },

    {
        timestamps: true
    }
)

applicationSchema.index(
    {
        worker: 1,
        job: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Application", applicationSchema)