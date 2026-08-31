const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
            firstName: {
                type: String,
                required: [true, "First name is required"],
                trim: true,
                minlength: [3, "First name must be at least 3 characters"],
                maxlength: [15, "First name can not exceed 15 characters"]
        },

            lastName: {
                type: String,
                required: [true, "Last name is required"],
                trim: true,
                minlength: [3, "Last name must contain at least 3 characters"],
                maxlength: [15, "Last name can not exceed 15 characters"]
        },

            email: {
                type: String,
                required: [true, "email address is required"],
                trim: true,
                unique: true,
                lowercase: true,
                match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
            },

            password: {
                type: String,
                required: [true, "Password is required"],
                minlength: [8, "Password must contain at least 8 charachters"],
                select: false
            },

            role: {
                type: String,
                enum: ["admin", "employer", "worker"],
                default: "worker"
            },

            phone: {
                type: String,
                trim: true,
                match: [/^01[0125]\d{8}$/, "Please enter a valid phone number"]
            },

            location: {
                type: String,
                trim: true
            },

            profileImage: {
                type: String,
                trim: true,
                default: "default-profile-picture.webp"
            },

            bio: {
                type: String,
                trim: true,
                maxlength: [500, "Bio can not exceed 500 characters"]
            },

            skills: {
                type: [String],
                default: []
            },

            experience: {
                type: String,
                trim: true
            },

            availability:{
                type: String,
                trim: true
            },

            workedJobs: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: "Job",
                default: []
            },

            isActive: {
                type: Boolean,
                default: true
            },
    },

    {
        timestamps: true
    }
)

userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcryptjs.hash(this.password, 10)
    }
})

module.exports = mongoose.model("User", userSchema)