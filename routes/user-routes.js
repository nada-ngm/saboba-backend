const userController = require("../controllers/user-controller")
const express = require("express")
const multerUpload = require("../middlewares/multer-middleware")
const authenticateMiddleware = require("../middlewares/authenticate-middleware")
const authorizeMiddleware = require("../middlewares/authorize-middleware")

const router = express.Router()

router.
    route("/workers")
    .get(userController.getAllWorkers)

router.
    route("/employers")
    .get(userController.getAllEmployers)

router.
    route("/worker/:id")
    .patch(
        authenticateMiddleware,
        authorizeMiddleware("worker"),
        multerUpload.single("profileImage"),
        userController.updateWorker
    )

router.
    route("/employer/:id")
    .patch(
        authenticateMiddleware,
        authorizeMiddleware("employer"),
        multerUpload.single("profileImage"),
        userController.updateEmployer
    )

router.
    route("/password/:id")
    .patch(
        authenticateMiddleware,
        authorizeMiddleware("employer", "worker"),
        userController.updatePassword
    )


router.
    route("/:id")
    .get(userController.getUsersById)
    .delete(
        authenticateMiddleware,
        authorizeMiddleware("admin","employer", "worker"),
        userController.deleteUser
    )

module.exports = router