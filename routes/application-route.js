const applicationController = require("../controllers/application-controller")
const authenticationMiddleware = require("../middlewares/authenticate-middleware")
const authorizationMiddleware = require("../middlewares/authorize-middleware")
const multerUpload = require("../middlewares/multer-middleware")
const express = require("express")

const router = express.Router()

router.
    route("/")
    .get(
        authenticationMiddleware,
        authorizationMiddleware("admin"),
        applicationController.getAllApplications
    )
    .post(
        authenticationMiddleware,
        authorizationMiddleware("worker"),
        multerUpload.array("attachments", 5),
        applicationController.createApplication
    )

router.
    route("/:id")
    .get(
        authenticationMiddleware,
        authorizationMiddleware("admin", "employer", "worker"),
        applicationController.getApplicationById
    )
    .patch(
        authenticationMiddleware,
        authorizationMiddleware("employer", "worker"),
        multerUpload.array("attachments", 5),
        applicationController.updateApplication
    )
    .delete(
        authenticationMiddleware,
        authorizationMiddleware("admin", "worker"),
        applicationController.deleteApplication
    )

router.
    route("/job/:jobId")
    .get(
        authenticationMiddleware,
        authorizationMiddleware("admin", "employer"),
        applicationController.getAllJobApplications
    )

router.
    route("/accept/:id")
    .patch(
        authenticationMiddleware,
        authorizationMiddleware("employer"),
        applicationController.acceptApplication
    )

module.exports = router