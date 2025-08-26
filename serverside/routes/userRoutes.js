import express from 'express';
import passport from 'passport';
import { Signup, Login, Logout } from '../controllers/authController.js';
import { googleCallback, googleFailure } from '../controllers/oauthController.js';
import refreshAccessToken from '../controllers/Token.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { getUserDetails } from '../controllers/User-controller.js';

const router = express.Router();

// Regular auth routes
router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', authenticateToken, Logout);
router.post('/refresh-token', refreshAccessToken);
router.get('/getuser',authenticateToken,getUserDetails);


router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/api/auth/google/failure',
        session: false 
    }),
    googleCallback
);

router.get('/google/failure', googleFailure);

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            profileImage: req.user.profileImage,
            budget: req.user.budget
        }
    });
});

export default router;