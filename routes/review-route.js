const reviewController = require("../controllers/review-controller")
const express = require("express")
const multerUpload = require("../middlewares/multer-middleware")
const authenticateMiddleware = require("../middlewares/authenticate-middleware")
const authorizeMiddleware = require("../middlewares/authorize-middleware")

const router = express.Router()

router.
    route("/")
    .get(
        authenticateMiddleware,
        authorizeMiddleware("admin"),
        reviewController.getAllReviews
    )

router.
    route("/:id")
    .get(
        reviewController.getReviewById
    )
    .patch(
        authenticateMiddleware,
        authorizeMiddleware("employer"),
        multerUpload.array("images", 5),
        reviewController.updateReview
    )
    .delete(
        authenticateMiddleware,
        authorizeMiddleware("admin", "employer"),
        reviewController.deleteReview
    )

router.
    route("/worker/:workerId")
    .get(
        reviewController.getAllWorkerReviews
    )
    .post(
        authenticateMiddleware,
        authorizeMiddleware("employer"),
        multerUpload.array("images", 5),
        reviewController.createReview
    )

module.exports = router