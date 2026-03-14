import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";
import { sendSmsOtp } from "../utils/sendSmsOtp.js";


/* REGISTER USER */
export const register = async (req, res) => {
  try {

    const { name, email, phone } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Name and email or phone required"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = new User({
      name,
      email,
      phone,
      image
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/* SEND OTP */

export const login = async (req, res) => {
  try {

    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or phone required"
      });
    }

    // search by either field so both email-based and phone-based logins work
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
if (user.otpResendTime && user.otpResendTime > Date.now()) {

  const remainingTime = Math.ceil(
    (user.otpResendTime - Date.now()) / 1000
  );

  return res.status(429).json({
    success: false,
    message: `Please wait ${remainingTime}s before requesting new OTP`
  });
}

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpire = Date.now() + 60 * 1000;   // OTP valid 60s
    user.otpResendTime = Date.now() + 60 * 1000; // resend after 60s

    await user.save();

    if (email) {
      await sendEmailOtp(email, otp);
    }

 if (phone) {
  await sendSmsOtp(`+91${phone}`, otp);
}

    res.status(200).json({
      message: "OTP sent successfully",
      expireIn: 60
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const verifyOtp = async (req, res) => {

  try {

    const { email, phone, otp } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        message: "OTP not found"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    user.otp = null;
    user.otpExpire = null;
    user.otpResendTime = null;

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
export const resendOtp = async (req, res) => {

  try {

    const { email, phone } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.otpResendTime && user.otpResendTime > Date.now()) {

      const remainingTime = Math.ceil(
        (user.otpResendTime - Date.now()) / 1000
      );

      return res.status(429).json({
        message: `Please wait ${remainingTime}s to resend OTP`
      });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpire = Date.now() + 60 * 1000;
    user.otpResendTime = Date.now() + 60 * 1000;

    await user.save();

    if (email) await sendEmailOtp(email, otp);
   if (phone) { await sendSmsOtp(`+91${phone}`, otp);}

    res.status(200).json({
      message: "OTP resent successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
export const getProfile = async (req, res) => {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const user = await User.findById(req.user.id)
      .select("-otp -otpExpire -otpResendTime");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logout successful"
  });
};
