import User from '../models/User.js'
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', quality: 'auto' },
    ],
  },
});

// Multer middleware for file upload
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch profile" });
  }
};

// ✅ Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email, PhoneNum, budget } = req.body;

    // Validation
    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (PhoneNum && !/^[0-9]{10}$/.test(PhoneNum)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    if (budget !== undefined && budget < 0) {
      return res.status(400).json({ message: "Budget cannot be negative" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For Google users, don't allow email changes
    const updateData = {
      username: username.trim(),
      PhoneNum: PhoneNum || undefined,
      budget: budget !== undefined ? Number(budget) : user.budget,
    };

    // Only update email if it's not a Google user
    if (!user.googleId && email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      
      updateData.email = email.toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken` 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
};

// ✅ Upload Profile Image to Cloudinary
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Get the uploaded image URL from Cloudinary
    const imageUrl = req.file.path;

    // Update user's profile image in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile image uploaded successfully",
      imageUrl: imageUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
};

// ✅ Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has Google authentication (no password)
    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        message: "Cannot change password for Google authenticated accounts" 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message || "Failed to change password" });
  }
};

// ✅ Delete Profile Image
export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has a profile image stored on Cloudinary, delete it
    if (user.profileImage) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = user.profileImage.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(`profile_images/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    // Remove profile image URL from database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: null },
      { new: true }
    ).select('-password -refreshToken');

    res.status(200).json({
      message: "Profile image deleted successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Delete profile image error:", error);
    res.status(500).json({ message: error.message || "Failed to delete profile image" });
  }
};

// ✅ Get User Statistics (for dashboard)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('username email budget createdAt');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate days since joining
    const daysSinceJoining = Math.floor(
      (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    const stats = {
      username: user.username,
      email: user.email,
      budget: user.budget,
      daysSinceJoining,
      joinDate: user.createdAt,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch user statistics" });
  }
};

// ✅ Update User Budget Only
export const updateBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { budget } = req.body;

    if (budget === undefined || budget < 0) {
      return res.status(400).json({ message: "Valid budget amount is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { budget: Number(budget) },
      { new: true }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Budget updated successfully",
      budget: updatedUser.budget,
      user: updatedUser
    });
  } catch (error) {
    console.error("Update budget error:", error);
    res.status(500).json({ message: error.message || "Failed to update budget" });
  }
};

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