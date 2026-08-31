const authController = require("../controllers/auth-controller")
const express = require("express")
const multerUpload = require("../middlewares/multer-middleware")

const router = express.Router()

router.post("/signup", multerUpload.single("profileImage"), authController.signup)
router.post("/signin", authController.signin)

module.exports = router 