import Author from "../models/authorsModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendAuthorEmailVerificationLink,
  sendAuthorPasswordResetLink,
  // sendVerificationCode,
  // sendPasswordResetVerificationCode,
} from "../utils/utils.js";

const createAuthor = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    if (!first_name || !last_name || !email || !password) {
      const err = new Error(
        "Firstname, Lastname, Email and Password is required"
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

    // Check for existing author
    const authorExists = await Author.findOne({ email });
    if (authorExists) {
      res.status(409);
      const err = new Error(
        "Author with this email already exists. Please use a different email address"
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
    const verificationEmailResponse = await sendAuthorEmailVerificationLink(
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

    // Save Author to DB
    await Author.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
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

const verifyEmail = async (req, res, next) => {
  try {
    const author = await Author.findOne({
      verify_token: req.params.verifyToken,
    });
    console.log(author._id.toString());
    if (!author) {
      return res.render("email_verified", {
        success: false,
        message: "Invalid verification token.",
      });
    }

    if (author.verify_token_expires <= Date.now()) {
      if (!author.verified) {
        await author.deleteOne();
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

    if (author.verified) {
      return res.render("email_verified", {
        success: true,
        message: "Email is already verified. Please login.",
      });
    }

    // Verify the user
    author.verified = true;
    await author.save();

    return res.render("email_verified", {
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return next(error);
  }
};

const loginAuthor = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new Error("Email & Password are required");
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
    const author = await Author.findOne({ email });
    if (!author) {
      const err = new Error("author not found");
      err.statusCode = 400;
      return next(err);
    }
    if (!author.verified) {
      const err = new Error(
        "Your account verification is pending. Please verify your email to continue"
      );
      err.statusCode = 409;
      return next(err);
    }

    // check for password match
    const passwordMatched = await bcrypt.compare(password, author.password);
    console.log(passwordMatched);
    if (!passwordMatched) {
      const err = new Error("Invalid email or password");
      err.statusCode = 400;
      return next(err);
    }

    // generate the token
    const token = jwt.sign(
      { authorId: author._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: 2592000,
      }
    );
    author.token = token;
    await author.save();

    // our token exp time
    const expiresIn = 2592000;
    // res.status(200).json({ token, expiresIn });
    res.status(200).json({ message: "Login Successfull" });
  } catch (error) {
    return next(error);
  }
};

const getAuthorProfile = async (req, res, next) => {
  try {
    const author = await Author.findById(req.author._id);

    if (!author) {
      const err = new Error("Author not found");
      err.statusCode = 404;
      return next(err);
    }

    const profileData = {
      _id: author._id,
      first_name: author.first_name,
      last_name: author.last_name,
      email: author.email,
      languages: author.languages,
    };

    res.status(200).json({ profileData });
  } catch (error) {
    return next(error);
  }
};

const updateAuthorProfile = async (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  try {
    const author = await Author.findById(req.author._id);
    if (!author) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    if (first_name || last_name) {
      author.first_name = first_name || author.first_name;
      author.last_name = last_name || author.last_name;
    }

    if (email && email !== author.email) {
      const authorExists = await Author.findOne({ email });

      if (authorExists) {
        const err = new Error(
          `${email} is already in use, please choose a different one`
        );
        err.statusCode = 409;
        return next(err);
      }
      author.email = email;
    }
    await author.save();
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
    const author = await Author.findById(req.author._id);
    if (!author) {
      const err = new Error("Author not found");
      err.statusCode = 404;
      return next(err);
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    author.password = hashedPassword;
    await author.save();
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
    const author = await Author.findOne({ email });
    if (!author) {
      const err = new Error("Email not found");
      err.statusCode = 400;
      return next(err);
    }
    // generate token
    const token = jwt.sign(
      { authorId: author._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    // save token in DB
    author.reset_password_token = token;
    author.reset_password_expires = Date.now() + 7200000;
    await author.save();
    // send mail
    const verificationEmailResponse = await sendAuthorPasswordResetLink(
      email,
      token,
      author.first_name
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
    const author = await Author.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }, // Check if token is still valid
    });

    // Log the token, current time, and token expiry for debugging
    console.log("Reset Token:", token); // Log the reset token
    console.log("Current Time:", Date.now()); // Log the current time
    console.log("Token Expiry:", author?.reset_password_expires); // Log the token expiry date

    if (!author) {
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
    author.password = hashedPassword;
    author.reset_password_token = undefined;
    author.reset_password_expires = undefined;

    // Save the updated user object
    await author.save();

    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error); // Pass any errors to the error-handling middleware
  }
};

export {
  createAuthor,
  verifyEmail,
  loginAuthor,
  getAuthorProfile,
  updateAuthorProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
};
