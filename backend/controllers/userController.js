import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return sendError(res, "User doesn't exists", 404)
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            return sendSuccess(res, { token })

        }
        else {
            return sendError(res, 'Invalid credentials', 401)
        }

    } catch (error) {
        console.log(error);
        return sendError(res, error.message, 500)
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return sendError(res, "User already exists", 400)
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return sendError(res, "Please enter a valid email", 400)
        }
        if (password.length < 8) {
            return sendError(res, "Please enter a strong password", 400)
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        return sendSuccess(res, { token }, 201)

    } catch (error) {
        console.log(error);
        return sendError(res, error.message, 500)
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            return sendSuccess(res, { token })
        } else {
            return sendError(res, "Invalid credentials", 401)
        }

    } catch (error) {
        console.log(error);
        return sendError(res, error.message, 500)
    }
}

// Route for user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select("-password");

        if (!user) {
            return sendError(res, "User not found", 404);
        }

        return sendSuccess(res, { user });
    } catch (error) {
        console.log(error);
        return sendError(res, error.message, 500);
    }
}


export { loginUser, registerUser, adminLogin, getUserProfile }
