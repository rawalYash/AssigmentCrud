const express = require("express");
const router = express.Router();
const controller = require("../controller/user");
const auth = require("../middleware/auth")
const uploadMiddleware = require("../middleware/imageuploader")

router.post("/",uploadMiddleware, controller.adduser);

router.get("/",auth, controller.findalluser)

router.get("/:id", auth, controller.findbyid)

router.put("/:id" , controller.updateuser);

router.delete("/:id", controller.deleteuser)

router.post("/login", controller.login)

router.post("/changepassword",auth, controller.changePassword)

router.post("/profileimage", uploadMiddleware, controller.fileupload)

router.post("/forgotpassword", controller.forgotPassword);

router.post("/resetpassword/:token" ,auth ,  controller.resetPassword)

module.exports = router;