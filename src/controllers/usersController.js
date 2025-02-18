import User from "../models/usersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendEmailVerificationLink,
  sendPasswordResetLink,
  // sendVerificationCode,
  // sendPasswordResetVerificationCode,
} from "../utils/utils.js";

//  Create User
const createUser = async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;
  try {
    if (!first_name || !last_name || !email || !password || !role) {
      const err = new Error(
        "Firstname, Lastname, Email,Password, role is required"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Check for valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error("Invalid email address");
      res.status(400);
      return next(err);
    }

    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      const err = new Error(
        "User with this email already exists. Please use a different email address"
      );
      err.statusCode = 409;
      return next(err);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // // Send verification email
    const verificationEmailResponse = await sendEmailVerificationLink(
      email,
      token,
      first_name
    );

    // Handle email sending error
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send verification email, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    // Save user to DB
    await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
      verify_token: token,
      verify_token_expires: Date.now() + 7200000, // 2 hours
    });

    // Respond with success message
    res.status(201).json({
      message:
        "Registered successfully. Please check your email to verify the account",
    });
  } catch (error) {
    return next(error);
  }
};

//  verify email

const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verify_token: req.params.verifyToken });
    console.log(user._id.toString());
    if (!user) {
      return res.render("email_verified", {
        success: false,
        message: "Invalid verification token.",
      });
    }

    if (user.verify_token_expires <= Date.now()) {
      if (!user.verified) {
        await user.deleteOne();
        return res.render("email_verified", {
          success: false,
          message: "Verification link has expired. Please register again.",
        });
      } else {
        return res.render("email_verified", {
          success: false,
          message: "Please login to continue.",
        });
      }
    }

    if (user.verified) {
      return res.render("email_verified", {
        success: true,
        message: "Email is already verified. Please login.",
      });
    }

    // Verify the user
    user.verified = true;
    await user.save();

    return res.render("email_verified", {
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return next(error);
  }
};

// login user

const loginUser = async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    const err = new Error("Email,Password & role are required");
    err.statusCode = 400;
    return next(err);
  }
  // check for valid email adress
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    const err = new Error("Invalid email address");
    return next(err);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 400;
      return next(err);
    }
    if (!user.verified) {
      const err = new Error(
        "Your account verification is pending. Please verify your email to continue"
      );
      err.statusCode = 409;
      return next(err);
    }

    // check for password match
    const passwordMatched = await bcrypt.compare(password, user.password);
    console.log(passwordMatched);
    if (!passwordMatched) {
      const err = new Error("Invalid email or password");
      err.statusCode = 400;
      return next(err);
    }

    if (user.role !== role) {
      const err = new Error("Invalid role");
      err.statusCode = 400;
      return next(err);
    }

    // generate the token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: 2592000,
      }
    );
    user.token = token;
    await user.save();

    // our token exp time
    const expiresIn = 2592000;
    res.status(200).json({ token, expiresIn, message: "Login Successfull" });
    // res.status(200).json({ message: "Login Successfull" });
  } catch (error) {
    return next(error);
  }
};

// get user profile

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    const profileData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({ profileData });
  } catch (error) {
    return next(error);
  }
};

// update user profile

const updateUserProfile = async (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    if (first_name || last_name) {
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
    }

    if (email && email !== user.email) {
      const userExists = await User.findOne({ email });

      if (userExists) {
        const err = new Error(
          `${email} is already in use, please choose a different one`
        );
        err.statusCode = 409;
        return next(err);
      }
      user.email = email;
    }
    await user.save();
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Email not found");
      err.statusCode = 400;
      return next(err);
    }
    // generate token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    // save token in DB
    user.reset_password_token = token;
    user.reset_password_expires = Date.now() + 7200000;
    await user.save();
    // send mail
    const verificationEmailResponse = await sendPasswordResetLink(
      email,
      token,
      user.first_name
    );
    // handle err
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send password reset link, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }
    res.status(200).json({
      message: "Password reset link sent successfully, please check your email",
    });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params; // token is passed via URL parameter
  const { password } = req.body;

  if (!token) {
    const err = new Error("Token is required");
    err.statusCode = 400;
    return next(err);
  }
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Find the user by token and check if the reset token has expired
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }, // Check if token is still valid
    });

    // Log the token, current time, and token expiry for debugging
    console.log("Reset Token:", token); // Log the reset token
    console.log("Current Time:", Date.now()); // Log the current time
    console.log("Token Expiry:", user?.reset_password_expires); // Log the token expiry date

    if (!user) {
      console.log("User not found or token expired");

      const err = new Error(
        "Password reset link is invalid or expired, please try again"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token and expiry
    user.password = hashedPassword;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;

    // Save the updated user object
    await user.save();

    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error); // Pass any errors to the error-handling middleware
  }
};

export {
  createUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
};
