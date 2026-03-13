import express from "express";
import {
  register,
  login,
  verifyOtp,
  getProfile,
  resendOtp,
  logout
} from "../controller/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("image"), register);

router.post("/login", login);

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

router.get("/user-info", authMiddleware, getProfile);

router.post("/logout", logout);

export default router;