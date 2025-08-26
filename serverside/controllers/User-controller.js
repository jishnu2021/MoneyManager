import User from '../models/User.js'

export const getUserDetails = async (req,res) =>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password -refreshToken")
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}