import { generateAccessToken, generateRefreshToken } from "../utils/generateTokenUtils.js";

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
        }
        
        // Generate tokens
        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);
        
        // Update user with refresh token
        user.refreshToken = refreshToken;
        await user.save();
        
        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        // Redirect to frontend with access token
        res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${accessToken}`);
        
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
};

export const googleFailure = (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_cancelled`);
};