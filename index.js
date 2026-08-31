const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const path = require("path")
const express = require("express")
const cors = require("cors")

require("dotenv").config()
const dbConnect = require("./config/db-connect")

const authRouter = require("./routes/auth-route")
const jobRouter = require("./routes/job-route")
const applicationRouter = require("./routes/application-route")
const reviewRouter = require("./routes/review-route")
const userRouter = require("./routes/user-routes")

const app = express()

dbConnect()

app.use(cors({origin: "http://localhost:4200"}))

app.use(express.json())

app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/jobs", jobRouter)
app.use("/api/v1/applications", applicationRouter)
app.use("/api/v1/reviews", reviewRouter)
app.use("/api/v1/users", userRouter)

app.listen(process.env.PORT, ()=>{
    console.log(`Server Running on Port ${process.env.PORT}`)
})