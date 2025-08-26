import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokenUtils.js";
import bcrypt from 'bcrypt'

const handleErrors = (err) =>{
    console.log(err.message,err.code)
    let errors = { email :'',password:''};

    if(err.message === 'Incorrect Email'){
        errors.email = 'This email is not registered'
    }
    if(err.message === 'Incorrect Password'){
        errors.password = 'This password is wrong'
    }

    if (err.code === 11000){
        errors.email = 'that email is already registered'
        return errors
    }
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) =>{
           errors[properties.path] = properties.message
        })
    }

    return errors;
}


export const Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existsuser = await User.findOne({ email });
    if (existsuser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ username, email, password });

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production with https
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.status(201).json({
      message: "User created successfully",
      accessToken, // only send access token to frontend
      user: {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || null,
  }
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User is not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      user: {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || null,
  }
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};


export const Logout = async (req,res) =>{
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.refreshToken = null
    await user.save()
    res.cookie('refreshToken','',{maxAge:1})
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({errors})
  }
}