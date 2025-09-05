import dotenv from 'dotenv'
import  RefreshToken  from "../models/refreshToken.js";
import jwt from 'jsonwebtoken'

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (user) =>{
    const payload = {
        userId: user._id.toString(),
        name:user.username,
        email:user.email
    }
    return jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:"45m"})
}

export const generateRefreshToken = async (user) =>{
    const payload = {
    userId: user._id.toString(), 
  };

  const refreshToken =  jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", 
  });

await RefreshToken.create({
    userId: user._id,
     token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return refreshToken;

}