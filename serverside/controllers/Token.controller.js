import RefreshToken from '../models/refreshToken.js'

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // assuming stored in cookie
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    // Check if refresh token exists in DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) return res.status(403).json({ error: "Invalid token" });

    // Verify token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token expired/invalid" });

      // Issue new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};



export default refreshAccessToken;