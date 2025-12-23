const jwt = require('jsonwebtoken');

// Optional auth middleware - doesn't fail if no token, but attaches user info if valid token exists
const optionalAuthMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue without user info
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );

        // Attach user info to request
        req.user = decoded;
        next();

    } catch (error) {
        // If token is invalid or expired, continue without user info
        req.user = null;
        next();
    }
};

module.exports = optionalAuthMiddleware;

