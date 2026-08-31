const jobController = require("../controllers/job-controller")
const express = require("express")
const multerUpload = require("../middlewares/multer-middleware")
const authenticateMiddleware = require("../middlewares/authenticate-middleware")
const authorizeMiddleware = require("../middlewares/authorize-middleware")

const router = express.Router()

router.
    route("/")
    .get(jobController.getAllJobs)
    .post(
        authenticateMiddleware,
        authorizeMiddleware("employer"),
        multerUpload.array("images", 5),
        jobController.createJob
    )

router.
    route("/:id")
    .get(jobController.getJobById)
    .patch(
        authenticateMiddleware,
        authorizeMiddleware("employer", "admin"),
        multerUpload.array("images", 5),
        jobController.UpdateJob
    )
    .delete(
        authenticateMiddleware,
        authorizeMiddleware("employer", "admin"),
        jobController.deleteJob
    )

module.exports = router